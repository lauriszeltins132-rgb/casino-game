# Kraken's Lair — Art Generation Prompt Sheet

Use these with Midjourney v6/v7, SDXL, Leonardo, or Firefly. Each prompt is written to push toward painted/rendered game-art realism and away from flat cartoon/emoji style. Generate at highest available resolution — assets need to hold up at full screen width, not thumbnail size.

**Universal style anchor** (paste into every prompt for consistency):

> AAA slot game art, painted digital illustration, dramatic cinematic lighting, rich material detail, Pragmatic Play / Hacksaw Gaming art style

---

## Asset file naming (drop into `client/public/assets/`)

| Prompt # | Save as | Used for |
|----------|---------|----------|
| 1 Background | `background.webp` (or `.png`) | Full-screen scene behind reels |
| 2 Reel frame | `reel-frame.webp` | Vault border around reel grid |
| 3 Symbols | `symbols/{id}.webp` | One file per game symbol ID (see mapping below) |
| 4 Hero kraken | `hero-kraken.webp` | Bonus-buy cinematic / feature intro |

The game loads raster assets automatically when present and falls back to SVG placeholders when missing.

### Symbol ID mapping (prompt subject → filename)

Current math uses nautical symbol IDs. When saving generated art, use these filenames:

| Tier | Prompt subject | Save as `symbols/` |
|------|----------------|-------------------|
| Low | rope coil / card "10" style | `rope.webp` |
| Low | barnacle cluster | `barnacle.webp` |
| Low | anchor chain | `anchor_chain.webp` |
| Low | ship's wheel | `wheel.webp` |
| Mid | jellyfish (or compass motif) | `compass.webp` |
| Mid | eel (or spyglass motif) | `spyglass.webp` |
| Mid | anglerfish (or map motif) | `map.webp` |
| Mid | pufferfish (or ship's bell) | `bell.webp` |
| High | golden skull idol | `skull.webp` |
| High | sunken crown | `crown.webp` |
| High | treasure chest | `chest.webp` |
| Wild | kraken eye medallion | `wild.webp` |
| Scatter | kraken silhouette | `scatter.webp` |

You can generate the prompt-sheet creatures/cards and map them to these IDs, or regenerate prompts using the nautical names above — math does not change either way.

---

## 1. Background scene (do this first — everything keys off its lighting)

```
Stormy ocean scene for a premium slot game background, viewed from behind
a carved wooden ship's vault frame looking out at a dark churning sea,
overcast bruised sky with a single shaft of pale light breaking through
storm clouds, a half-sunken shipwreck listing on rocks in the mid-distance
with torn sails and broken masts, faint bioluminescent teal-green glow
emanating from the water near the base of the frame as if something vast
is beneath the surface, scattered wooden barrels and rope debris floating
in the foreground shallows, wet rock and barnacle texture on nearby
surfaces, painted digital illustration, moody desaturated blue-grey palette
with selective teal glow accents, dramatic volumetric lighting, highly
detailed, cinematic wide composition, AAA slot game background art,
Pragmatic Play art style, ultra detailed, 4k game asset

--ar 16:9 --style raw
```

**Avoid:** cartoon, flat colors, emoji, low detail, blurry, simple shapes, anime, chibi, bright saturated primary colors, clean vector art

---

## 2. Reel frame / vault border

```
Ornate carved wooden and brass treasure vault door frame for a pirate slot
game, thick weathered dark oak with aged brass corner reinforcements and
rivets, carved relief of coiling kraken tentacles and rope knotwork along
the top arch, barnacle and kelp growth creeping into the lower corners,
tarnished gold leaf details catching dim light, wet sheen on the wood,
photorealistic material rendering, painted game asset style, transparent
center cutout, symmetrical design, ornamental frame border only, no
background, product-shot lighting

--ar 1:1 --style raw
```

**Avoid:** flat, thin border, modern, minimalist, plastic, clean lines, cartoon

---

## 3. Symbol set — plain dark background for clean cutout

**Low-tier (4 symbols):**
```
Ornate weathered playing card symbol "10" (repeat for A, K, Q, J) carved
into aged bronze medallion with rope-knot border, engraved nautical style,
sea-worn patina, dim gold highlights, painted slot game symbol icon,
centered composition, dark navy background, dramatic rim lighting,
photorealistic material detail, AAA casino game art

--ar 1:1 --style raw
```

**Mid-tier sea creatures** (one prompt per creature):
```
Bioluminescent jellyfish glowing teal-green against dark water, translucent
bell with delicate trailing tentacles emitting soft light, painted digital
illustration, slot game symbol icon, dramatic underwater lighting, dark
background, highly detailed, photorealistic rendering, AAA casino game art

--ar 1:1 --style raw
```

Variants: eel (serpentine body, electric spine glow), anglerfish (lure + teeth), pufferfish (spiked body, glowing eyes).

**High-tier treasure:**
```
Golden skull idol encrusted with barnacles and coral, ancient cursed
treasure artifact, hollow glowing green eyes, ornate carved detail,
painted digital illustration, dramatic rim lighting on wet gold surface,
dark background, photorealistic material rendering, AAA slot game symbol,
highly detailed

--ar 1:1 --style raw
```

Also: sunken jeweled crown on barnacle rock; open treasure chest with coins and gems.

**Wild:**
```
Glowing kraken eye symbol, massive luminous teal-gold eye surrounded by
dark tentacle coils forming a circular medallion frame, intense inner
glow, painted digital illustration, dramatic lighting, dark background,
photorealistic detail, AAA slot game wild symbol icon

--ar 1:1 --style raw
```

**Scatter:**
```
Small menacing kraken silhouette emerging from dark water, glowing
red-gold outline, tentacles curling upward, ominous atmospheric lighting,
painted digital illustration, dark background, photorealistic detail,
AAA slot game scatter symbol icon

--ar 1:1 --style raw
```

---

## 4. Hero kraken (bonus-buy cinematic)

```
Massive terrifying kraken emerging from stormy dark ocean water, enormous
tentacles wrapping around a wrecked ship, bioluminescent teal markings
along its skin, glowing eyes, dramatic storm lighting with lightning in
the background, painted digital illustration, cinematic composition, epic
scale, highly detailed skin texture with wet sheen, AAA game key art style,
dark moody color grade with teal and gold accent lighting

--ar 16:9 --style raw
```

---

## Workflow after generation

1. Generate 3–4 variations per prompt; use img2img / variation on near-misses instead of full rerolls.
2. Keep symbol backgrounds flat/dark (`plain dark navy background, no scene`) for easy alpha cutout.
3. Export as **WebP** (preferred) or PNG; place files in `client/public/assets/` per the naming table above.
4. Run `npm run dev` — the client auto-detects raster assets and swaps them in for SVG placeholders.
5. For production platforms, some image models restrict “gambling” — reframe as “fantasy treasure game asset” if filters trigger.

### Optional batch alpha pass

```bash
# Example: remove.bg API or manual Photoshop/GIMP alpha
# Output transparent PNGs for symbols + reel frame, then convert to WebP
```

---

## Integration checklist

- [ ] `client/public/assets/background.webp`
- [ ] `client/public/assets/reel-frame.webp`
- [ ] `client/public/assets/hero-kraken.webp`
- [ ] `client/public/assets/symbols/*.webp` (13 files)
- [ ] Visual pass at 1920×1080 and mobile portrait
- [ ] Confirm reel frame center cutout aligns with 5×3 grid (adjust CSS `--frame-inset` if needed)
