/**
 * SoundManager
 * Autarkes 16-Bit Chiptune Audio-System über die Web Audio API.
 * Keine externen MP3-Dateien erforderlich!
 */
export class SoundManager {
  private static ctx: AudioContext | null = null;
  private static isMuted: boolean = false;
  private static isMusicPlaying: boolean = false;
  private static musicTimer: any = null;
  private static currentNoteIndex: number = 0;

  // Eingängige Retro-Melodie & Basslinie
  private static melody = [
    261.63, 293.66, 329.63, 392.00, 329.63, 293.66, 261.63, 220.00,
    261.63, 329.63, 392.00, 440.00, 392.00, 329.63, 293.66, 261.63,
    349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23, 293.66,
    392.00, 440.00, 493.88, 587.33, 493.88, 440.00, 392.00, 329.63
  ];

  private static bassline = [
    130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00,
    130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00
  ];

  public static init(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public static toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMuted;
  }

  public static getIsMuted(): boolean {
    return this.isMuted;
  }

  public static startMusic(): void {
    this.init();
    if (this.isMuted || this.isMusicPlaying || !this.ctx) return;
    this.isMusicPlaying = true;
    this.currentNoteIndex = 0;

    const playStep = () => {
      if (!this.isMusicPlaying || this.isMuted || !this.ctx) return;

      const now = this.ctx.currentTime;
      const noteFreq = this.melody[this.currentNoteIndex % this.melody.length];
      const bassFreq = this.bassline[Math.floor(this.currentNoteIndex / 2) % this.bassline.length];

      // Lead Note
      this.playSynthNote(noteFreq, 0.16, 'square', 0.035, now);
      // Bass Note
      if (this.currentNoteIndex % 2 === 0) {
        this.playSynthNote(bassFreq, 0.28, 'triangle', 0.06, now);
      }

      this.currentNoteIndex++;
      this.musicTimer = setTimeout(playStep, 220); // Tempo
    };

    playStep();
  }

  public static stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private static playSynthNote(freq: number, duration: number, type: OscillatorType, volume: number, startTime: number): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch (e) {
      // Audio-Context blockiert vor Nutzerinteraktion
    }
  }

  // --- SOUND EFFEKTE ---
  public static playShoot(type: string): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'cannon') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'tesla') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.setValueAtTime(900, now + 0.05);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else {
        // Pfeil / Standard
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {}
  }

  public static playCoin(): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  public static playClick(): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  public static playUpgrade(): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.setValueAtTime(440, now + 0.06);
      osc.frequency.setValueAtTime(554.37, now + 0.12);
      osc.frequency.setValueAtTime(659.25, now + 0.18);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }
}
