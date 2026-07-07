/** Audio manager — placeholder hooks for production sound assets */

type SoundId = 'spin' | 'reel_stop' | 'win_small' | 'win_big' | 'win_epic' | 'scatter' | 'bonus_enter' | 'chest_open' | 'button' | 'rage_up';

const SOUND_FILES: Partial<Record<SoundId, string>> = {
  spin: '/audio/spin.mp3',
  reel_stop: '/audio/reel_stop.mp3',
  win_small: '/audio/win_small.mp3',
  win_big: '/audio/win_big.mp3',
  win_epic: '/audio/win_epic.mp3',
  scatter: '/audio/scatter.mp3',
  bonus_enter: '/audio/bonus_enter.mp3',
  chest_open: '/audio/chest_open.mp3',
  button: '/audio/button.mp3',
  rage_up: '/audio/rage_up.mp3',
};

class AudioManager {
  private enabled = true;
  private cache = new Map<string, HTMLAudioElement>();

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  play(id: SoundId) {
    if (!this.enabled) return;
    const src = SOUND_FILES[id];
    if (!src) return;

    try {
      let audio = this.cache.get(src);
      if (!audio) {
        audio = new Audio(src);
        audio.volume = 0.4;
        this.cache.set(src, audio);
      }
      audio.currentTime = 0;
      audio.play().catch(() => {});
    } catch {
      // Placeholder — files may not exist yet
    }
  }

  playWin(amount: number, bet: number) {
    const ratio = bet > 0 ? amount / bet : 0;
    if (ratio >= 20) this.play('win_epic');
    else if (ratio >= 5) this.play('win_big');
    else if (amount > 0) this.play('win_small');
  }
}

export const audio = new AudioManager();
