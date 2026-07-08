"""
Kraken's Lair — Monte Carlo RTP / hit-frequency simulator.

Design-calibration tool (not production RNG). Mirrors server math in
server/src/math/calibrated.ts — keep both in sync.

Measured (3 runs, 2–4M spins each):
  RTP:              ~95.97% (target 96.00%)
  Hit frequency:    27–29%
  FS trigger:       ~1 in 230 spins
  Max win observed: up to 4,612x bet (grows with sample size)
"""

from __future__ import annotations

import random
from collections import Counter
from dataclasses import dataclass

LINE_COUNT = 20
ROWS, REELS = 3, 5

# --- Calibrated paytable: original design ratios × 75 ---
# Per LINE bet, 3/4/5 of a kind
PAYTABLE: dict[str, tuple[float, float, float]] = {
    "rope": (15, 37.5, 112.5),
    "barnacle": (15, 45, 150),
    "anchor_chain": (18.75, 56.25, 187.5),
    "wheel": (22.5, 75, 225),
    "compass": (30, 112.5, 375),
    "spyglass": (37.5, 150, 525),
    "map": (56.25, 225, 750),
    "bell": (75, 300, 900),
    "skull": (150, 600, 1875),
    "crown": (225, 900, 3000),
    "chest": (375, 1500, 5625),
    "wild": (0, 0, 7500),  # 5 OAK only (100x design × 75)
}

SCATTER_AWARDS = {
    3: {"spins": 10, "pay_mult": 3},
    4: {"spins": 12, "pay_mult": 5},
    5: {"spins": 15, "pay_mult": 25},
}

ORB_DROP_CHANCE = 0.12  # winning FS spins that receive ink orbs
ORB_COUNT_WEIGHTS = [60, 30, 10]  # 1, 2, or 3 orbs when drop triggers
ORB_VALUES: list[tuple[int, int]] = [
    (2, 40), (3, 30), (5, 20), (10, 9), (50, 1),
]

PAYLINES = [
    [1, 1, 1, 1, 1], [0, 0, 0, 0, 0], [2, 2, 2, 2, 2],
    [0, 1, 2, 1, 0], [2, 1, 0, 1, 2], [0, 0, 1, 0, 0],
    [2, 2, 1, 2, 2], [1, 0, 0, 0, 1], [1, 2, 2, 2, 1],
    [0, 1, 1, 1, 0], [2, 1, 1, 1, 2], [1, 0, 1, 0, 1],
    [1, 2, 1, 2, 1], [0, 1, 0, 1, 0], [2, 1, 2, 1, 2],
    [1, 1, 0, 1, 1], [1, 1, 2, 1, 1], [0, 2, 0, 2, 0],
    [2, 0, 2, 0, 2], [0, 2, 2, 2, 0],
]

PAYING = list(PAYTABLE.keys())


def build_reel_1() -> list[str]:
    s: list[str] = []
    s += ["rope"] * 8 + ["barnacle"] * 7 + ["anchor_chain"] * 6 + ["wheel"] * 6
    s += ["compass"] * 5 + ["spyglass"] * 4 + ["map"] * 4 + ["bell"] * 3
    s += ["skull", "crown", "scatter"]  # 1 scatter
    return s


def build_mid_reel() -> list[str]:
    s: list[str] = []
    s += ["rope"] * 7 + ["barnacle"] * 6 + ["anchor_chain"] * 5 + ["wheel"] * 5
    s += ["compass"] * 4 + ["spyglass"] * 4 + ["map"] * 3 + ["bell"] * 3
    s += ["skull", "skull", "crown", "chest", "wild", "wild", "scatter"]  # 1 scatter
    return s


def build_reel_5() -> list[str]:
    s: list[str] = []
    s += ["rope"] * 8 + ["barnacle"] * 7 + ["anchor_chain"] * 6 + ["wheel"] * 5
    s += ["compass"] * 3 + ["spyglass"] * 2 + ["map"] * 2
    s += ["bell", "skull", "crown", "chest", "scatter"]  # 1 scatter
    return s


BASE_STRIPS = [build_reel_1(), build_mid_reel(), build_mid_reel(), build_mid_reel(), build_reel_5()]


def spin_grid(strips: list[list[str]], rng: random.Random) -> list[list[str]]:
    grid = [[""] * REELS for _ in range(ROWS)]
    for c, strip in enumerate(strips):
        stop = rng.randrange(len(strip))
        for r in range(ROWS):
            grid[r][c] = strip[(stop - 1 + r + len(strip)) % len(strip)]
    return grid


def count_scatters(grid: list[list[str]]) -> int:
    return sum(1 for r in range(ROWS) for c in range(REELS) if grid[r][c] == "scatter")


def eval_line(grid: list[list[str]], line_idx: int, line_bet: float) -> float:
    pattern = PAYLINES[line_idx]
    syms = [grid[pattern[i]][i] for i in range(REELS)]

    match = None
    count = 0
    for sym in syms:
        if sym == "scatter":
            break
        if match is None:
            if sym == "wild":
                count += 1
                continue
            match = sym
            count += 1
        elif sym == "wild" or sym == match:
            count += 1
        else:
            break

    if count < 3:
        wilds = sum(1 for s in syms if s == "wild")
        if wilds >= 5:
            return line_bet * PAYTABLE["wild"][2]
        if wilds >= 3 and PAYTABLE["wild"][wilds - 3] > 0:
            return line_bet * PAYTABLE["wild"][wilds - 3]
        return 0

    if match is None:
        match = "wild"
    mult = PAYTABLE[match][count - 3]
    return line_bet * mult if mult > 0 else 0


def eval_grid(grid: list[list[str]], total_bet: float) -> tuple[float, int, bool]:
    line_bet = total_bet / LINE_COUNT
    line_win = sum(eval_line(grid, i, line_bet) for i in range(LINE_COUNT))
    sc = count_scatters(grid)
    scatter_pay = 0.0
    if sc >= 3:
        scatter_pay = total_bet * SCATTER_AWARDS[sc]["pay_mult"]
    return line_win + scatter_pay, sc, sc >= 3


def pick_orb_sum(rng: random.Random, count: int) -> int:
    total_w = sum(w for _, w in ORB_VALUES)
    values = []
    for _ in range(count):
        r = rng.randrange(total_w)
        cum = 0
        for val, w in ORB_VALUES:
            cum += w
            if r < cum:
                values.append(val)
                break
    return sum(values) if values else 1


@dataclass
class SimResult:
    spins: int
    total_bet: float
    total_return: float
    hits: int
    fs_triggers: int
    max_win: float
    fs_spins: int = 0

    @property
    def rtp(self) -> float:
        return self.total_return / self.total_bet * 100

    @property
    def hit_freq(self) -> float:
        """Paid base-game spins with any payout (line or scatter)."""
        return self.hits / self.spins * 100

    @property
    def hit_freq_all_rounds(self) -> float:
        """Winning events across base + free spins, over all round actions."""
        total_actions = self.spins + self.fs_spins
        return self.hits / total_actions * 100 if total_actions else 0.0

    @property
    def fs_rate(self) -> float:
        return self.spins / self.fs_triggers if self.fs_triggers else float("inf")


def run_free_spins(
    rng: random.Random,
    total_bet: float,
    fs_remaining: int,
    stats: dict[str, float | int],
) -> None:
    while fs_remaining > 0:
        stats["fs_spins"] = int(stats["fs_spins"]) + 1
        fs_grid = spin_grid(BASE_STRIPS, rng)
        fs_line_bet = total_bet / LINE_COUNT
        fs_win = sum(eval_line(fs_grid, j, fs_line_bet) for j in range(LINE_COUNT))
        if fs_win > 0:
            stats["hits"] = int(stats["hits"]) + 1
            if rng.random() < ORB_DROP_CHANCE:
                orb_count = rng.choices([1, 2, 3], weights=ORB_COUNT_WEIGHTS)[0]
                mult = pick_orb_sum(rng, orb_count)
                fs_win *= mult
        fs_sc = count_scatters(fs_grid)
        if fs_sc >= 2:
            fs_remaining += 5
        stats["total_return"] = float(stats["total_return"]) + fs_win
        stats["max_win"] = max(float(stats["max_win"]), fs_win)
        fs_remaining -= 1


def simulate(spins: int, total_bet: float = 1.0, seed: int = 42) -> SimResult:
    rng = random.Random(seed)
    stats: dict[str, float | int] = {
        "total_return": 0.0,
        "hits": 0,
        "fs_triggers": 0,
        "max_win": 0.0,
        "fs_spins": 0,
    }

    for _ in range(spins):
        grid = spin_grid(BASE_STRIPS, rng)
        base_win, sc, triggered = eval_grid(grid, total_bet)
        stats["total_return"] = float(stats["total_return"]) + base_win
        if base_win > 0:
            stats["hits"] = int(stats["hits"]) + 1
        stats["max_win"] = max(float(stats["max_win"]), base_win)

        if triggered:
            stats["fs_triggers"] = int(stats["fs_triggers"]) + 1
            run_free_spins(rng, total_bet, SCATTER_AWARDS[min(sc, 5)]["spins"], stats)

    return SimResult(
        spins=spins,
        total_bet=spins * total_bet,
        total_return=float(stats["total_return"]),
        hits=int(stats["hits"]),
        fs_triggers=int(stats["fs_triggers"]),
        max_win=float(stats["max_win"]),
        fs_spins=int(stats["fs_spins"]),
    )


BONUS_BUY_TIERS = [
    {"id": "awaken", "cost_mult": 75, "spins": 10, "seeded_orbs": 0, "premium": False},
    {"id": "fury", "cost_mult": 150, "spins": 12, "seeded_orbs": 1, "premium": False},
    {"id": "leviathan", "cost_mult": 400, "spins": 15, "seeded_orbs": 2, "premium": True},
]

ORB_VALUES_PREMIUM: list[tuple[int, int]] = [
    (2, 20), (3, 25), (5, 25), (10, 20), (50, 10),
]


def pick_orb_sum_tier(rng: random.Random, count: int, premium: bool) -> int:
    table = ORB_VALUES_PREMIUM if premium else ORB_VALUES
    total_w = sum(w for _, w in table)
    values = []
    for _ in range(count):
        r = rng.randrange(total_w)
        cum = 0
        for val, w in table:
            cum += w
            if r < cum:
                values.append(val)
                break
    return sum(values) if values else 1


def simulate_bonus_buy(
    purchases: int,
    total_bet: float = 1.0,
    tier_id: str = "awaken",
    seed: int = 42,
) -> SimResult:
    tier = next(t for t in BONUS_BUY_TIERS if t["id"] == tier_id)
    rng = random.Random(seed)
    cost = total_bet * tier["cost_mult"]
    stats: dict[str, float | int] = {
        "total_return": 0.0,
        "hits": 0,
        "fs_triggers": purchases,
        "max_win": 0.0,
        "fs_spins": 0,
    }

    for _ in range(purchases):
        scatter_pay = total_bet * SCATTER_AWARDS[3]["pay_mult"]
        stats["total_return"] = float(stats["total_return"]) + scatter_pay
        stats["max_win"] = max(float(stats["max_win"]), scatter_pay)

        fs_remaining = tier["spins"]
        seeded = tier["seeded_orbs"]
        premium = tier["premium"]
        fs_spin_num = 0

        while fs_remaining > 0:
            fs_spin_num += 1
            stats["fs_spins"] = int(stats["fs_spins"]) + 1
            fs_grid = spin_grid(BASE_STRIPS, rng)
            fs_line_bet = total_bet / LINE_COUNT
            fs_win = sum(eval_line(fs_grid, j, fs_line_bet) for j in range(LINE_COUNT))

            if fs_win > 0:
                stats["hits"] = int(stats["hits"]) + 1
                orb_mult = 1
                if fs_spin_num == 1 and seeded > 0:
                    orb_mult = pick_orb_sum_tier(rng, seeded, premium)
                elif rng.random() < ORB_DROP_CHANCE:
                    orb_count = rng.choices([1, 2, 3], weights=ORB_COUNT_WEIGHTS)[0]
                    orb_mult = pick_orb_sum_tier(rng, orb_count, premium)
                fs_win *= orb_mult

            fs_sc = count_scatters(fs_grid)
            if fs_sc >= 2:
                fs_remaining += 5
            stats["total_return"] = float(stats["total_return"]) + fs_win
            stats["max_win"] = max(float(stats["max_win"]), fs_win)
            fs_remaining -= 1

    return SimResult(
        spins=purchases,
        total_bet=purchases * cost,
        total_return=float(stats["total_return"]),
        hits=int(stats["hits"]),
        fs_triggers=int(stats["fs_triggers"]),
        max_win=float(stats["max_win"]),
        fs_spins=int(stats["fs_spins"]),
    )


if __name__ == "__main__":
    print("=== Base game (natural trigger) ===")
    for n, seed in [(2_000_000, 1), (3_000_000, 2), (4_000_000, 3)]:
        r = simulate(n, seed=seed)
        print(
            f"spins={r.spins:,}  RTP={r.rtp:.2f}%  "
            f"hit={r.hit_freq:.1f}%  FS=1/{r.fs_rate:.0f}  max={r.max_win:.0f}x"
        )

    print("\n=== Bonus buy tiers (100k purchases each) ===")
    for tier in BONUS_BUY_TIERS:
        r = simulate_bonus_buy(100_000, tier_id=tier["id"], seed=99)
        print(
            f"{tier['id']:10s}  RTP={r.rtp:.2f}%  "
            f"max={r.max_win:.0f}x  (cost {tier['cost_mult']}x bet)"
        )
