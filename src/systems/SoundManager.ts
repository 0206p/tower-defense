/**
 * SoundManager
 * Autarkes 16-Bit Chiptune Audio-System über die Web Audio API.
 * Keine externen MP3-Dateien erforderlich!
 */
export class SoundManager {
  private static ctx: AudioContext | null = null;
  private static STORAGE_KEY = 'td_sound_muted';
  private static isMuted: boolean = SoundManager.loadMuteState();
  private static isMusicPlaying: boolean = false;
  private static musicTimer: any = null;
  private static currentNoteIndex: number = 0;

  private static loadMuteState(): boolean {
    try {
      return localStorage.getItem('td_sound_muted') === 'true';
    } catch {
      return false;
    }
  }

  // Ruhige, atmosphärische RTS-Akkordfolge (D-Moll / F / G-Moll / A)
  private static chords = [
    // D-Moll 7 (Tief, weit, ruhig)
    [73.42, 110.0, 174.61, 261.63],
    // B-Dur 7
    [58.27, 87.31, 146.83, 220.0],
    // G-Moll 7
    [49.0, 73.42, 116.54, 174.61],
    // A-Moll 9
    [55.0, 82.41, 130.81, 196.0]
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
    try {
      localStorage.setItem(this.STORAGE_KEY, String(this.isMuted));
    } catch {}

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
      const currentChord = this.chords[this.currentNoteIndex % this.chords.length];

      this.playAtmosphericPad(currentChord, 4.0, now);
      this.playMelodicMotif(now);

      this.currentNoteIndex++;
      this.musicTimer = setTimeout(playStep, 3500); // Ruhiger, angenehmer 3.5s Takt
    };

    playStep();
  }

  // Sanfte, melodische Sci-Fi Lead-Notes (D-Moll Pentatonik)
  private static melodyScale = [
    293.66, // D4
    329.63, // E4
    349.23, // F4
    440.00, // A4
    523.25, // C5
    587.33  // D5
  ];

  private static playMelodicMotif(startTime: number): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const noteCount = 2;
      for (let i = 0; i < noteCount; i++) {
        const noteTime = startTime + 0.8 + i * 1.2;
        const noteIdx = (this.currentNoteIndex * 2 + i * 3) % this.melodyScale.length;
        const freq = this.melodyScale[noteIdx];

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, noteTime);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.0001, noteTime);
        gain.gain.linearRampToValueAtTime(0.018, noteTime + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.1);

        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 1.2);
      }
    } catch {}
  }

  public static stopMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private static playAtmosphericPad(frequencies: number[], duration: number, startTime: number): void {
    if (!this.ctx || this.isMuted) return;
    try {
      // Warmer Low-Pass-Filter: schneidet schrille Frequenzen ab
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(620, startTime);
      filter.Q.setValueAtTime(1.1, startTime);

      const masterGain = this.ctx.createGain();
      // Extrem sanfter Ein- und Ausklang (kein Klick, kein penetrantes Piepen)
      masterGain.gain.setValueAtTime(0.0001, startTime);
      masterGain.gain.linearRampToValueAtTime(0.032, startTime + 1.0);
      masterGain.gain.setValueAtTime(0.032, startTime + duration - 1.8);
      masterGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      filter.connect(masterGain);
      masterGain.connect(this.ctx.destination);

      frequencies.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        // Bass tief mit warmem Triangle, Obertöne weich mit Sine
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        // Leichte Schwebung für räumliche RTS-Atmosphäre
        osc.detune.setValueAtTime((idx % 2 === 0 ? 3 : -3), startTime);

        osc.connect(filter);
        osc.start(startTime);
        osc.stop(startTime + duration);
      });
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

  public static playExplosion(): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
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

  public static playDeny(): void {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(130, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch (e) {}
  }
}

