import { AcousticToastCue, Language } from '../types';

class AcousticEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // ============================================================================
  // 1. VEENA (वीणा) — For Revenue (+ जमा)
  // ============================================================================
  private triggerVeenaPluck(
    ctx: AudioContext,
    startTime: number,
    freq: number,
    glideToFreq: number | null,
    duration: number,
    volume = 0.26
  ) {
    // Main melody string + octave harmonic + fifth harmonic for authentic Jawari bridge resonance
    const oscMain = ctx.createOscillator();
    const oscOctave = ctx.createOscillator();
    const oscFifth = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const octaveGain = ctx.createGain();
    const fifthGain = ctx.createGain();

    oscMain.type = 'sawtooth';
    oscOctave.type = 'triangle';
    oscFifth.type = 'sine';

    oscMain.frequency.setValueAtTime(freq, startTime);
    oscOctave.frequency.setValueAtTime(freq * 2, startTime);
    oscFifth.frequency.setValueAtTime(freq * 2.998, startTime);

    // Optional Meend (smooth fret glide characteristic of Saraswati Veena)
    if (glideToFreq) {
      oscMain.frequency.exponentialRampToValueAtTime(glideToFreq, startTime + duration * 0.45);
      oscOctave.frequency.exponentialRampToValueAtTime(
        glideToFreq * 2,
        startTime + duration * 0.45
      );
      oscFifth.frequency.exponentialRampToValueAtTime(
        glideToFreq * 2.998,
        startTime + duration * 0.45
      );
    }

    // Jawari resonant filter envelope
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 6.5, startTime);
    filter.frequency.exponentialRampToValueAtTime(freq * 2.2, startTime + duration);
    filter.Q.setValueAtTime(3.2, startTime);

    octaveGain.gain.setValueAtTime(0.35, startTime);
    fifthGain.gain.setValueAtTime(0.18, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    oscMain.connect(filter);
    oscOctave.connect(octaveGain);
    octaveGain.connect(filter);
    oscFifth.connect(fifthGain);
    fifthGain.connect(filter);

    filter.connect(gain);
    gain.connect(ctx.destination);

    oscMain.start(startTime);
    oscOctave.start(startTime);
    oscFifth.start(startTime);

    oscMain.stop(startTime + duration + 0.02);
    oscOctave.stop(startTime + duration + 0.02);
    oscFifth.stop(startTime + duration + 0.02);
  }

  /**
   * Revenue (+ जमा): Plays Saraswati Veena (सरस्वती वीणा झंकार)
   * Ascending auspicious phrase: Sa -> Ga (Meend to Pa) -> Dha -> Taar Sa + Chikari
   */
  public playRevenueVeena(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.02;
    // Pluck 1: Madhya Sa (C4 = 261.63Hz)
    this.triggerVeenaPluck(ctx, now, 261.63, null, 0.45, 0.25);

    // Pluck 2: Ga gliding with Meend to Pa (329.63Hz -> 392.00Hz)
    this.triggerVeenaPluck(ctx, now + 0.16, 329.63, 392.0, 0.5, 0.26);

    // Pluck 3: Shuddha Dha (440.00Hz)
    this.triggerVeenaPluck(ctx, now + 0.34, 440.0, null, 0.45, 0.24);

    // Pluck 4: Resonant Taar Sa (523.25Hz) + High Chikari sympathetic string (783.99Hz)
    this.triggerVeenaPluck(ctx, now + 0.5, 523.25, null, 0.85, 0.28);
    this.triggerVeenaPluck(ctx, now + 0.53, 783.99, null, 0.65, 0.12);
  }

  // ============================================================================
  // 2. TABLA (तबला) — For Expense (- खर्च)
  // ============================================================================
  private triggerTablaBayan(ctx: AudioContext, startTime: number, withPitchMod: boolean) {
    // Left copper/clay Dagga (Bayan) deep bass stroke ("Ghe")
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';

    osc.frequency.setValueAtTime(108, startTime);
    if (withPitchMod) {
      // Classic Bayan wrist-heel pressure pitch bend
      osc.frequency.exponentialRampToValueAtTime(72, startTime + 0.09);
      osc.frequency.linearRampToValueAtTime(96, startTime + 0.18);
      osc.frequency.exponentialRampToValueAtTime(62, startTime + 0.32);
    } else {
      osc.frequency.exponentialRampToValueAtTime(65, startTime + 0.24);
    }

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.46, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.34);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.36);
  }

  private triggerTablaDayan(
    ctx: AudioContext,
    startTime: number,
    strokeType: 'na' | 'tin' | 'tun',
    fundamentalHz = 293.66 // D4 tuned Dayan
  ) {
    // Right wooden shell (Dayan) with black Syahi harmonic overtones
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const osc3 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc3.type = 'sine';

    if (strokeType === 'na') {
      // Crisp rim stroke "Na / Ta" (emphasizes 2nd & 3rd Syahi harmonics)
      osc1.frequency.setValueAtTime(fundamentalHz * 2.0, startTime);
      osc2.frequency.setValueAtTime(fundamentalHz * 3.01, startTime);
      osc3.frequency.setValueAtTime(fundamentalHz * 4.03, startTime);
    } else if (strokeType === 'tin') {
      // Sur / Maidani stroke "Tin"
      osc1.frequency.setValueAtTime(fundamentalHz * 1.0, startTime);
      osc2.frequency.setValueAtTime(fundamentalHz * 2.0, startTime);
      osc3.frequency.setValueAtTime(fundamentalHz * 3.0, startTime);
    } else {
      // Open resonant "Tun"
      osc1.frequency.setValueAtTime(fundamentalHz * 1.02, startTime);
      osc1.frequency.exponentialRampToValueAtTime(fundamentalHz, startTime + 0.28);
      osc2.frequency.setValueAtTime(fundamentalHz * 2.0, startTime);
      osc3.frequency.setValueAtTime(fundamentalHz * 2.5, startTime);
    }

    const duration = strokeType === 'na' ? 0.19 : 0.28;
    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.32, startTime + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    const g2 = ctx.createGain();
    const g3 = ctx.createGain();
    g2.gain.setValueAtTime(0.45, startTime);
    g3.gain.setValueAtTime(0.22, startTime);

    osc1.connect(gain);
    osc2.connect(g2);
    g2.connect(gain);
    osc3.connect(g3);
    g3.connect(gain);

    gain.connect(ctx.destination);

    osc1.start(startTime);
    osc2.start(startTime);
    osc3.start(startTime);

    osc1.stop(startTime + duration + 0.02);
    osc2.stop(startTime + duration + 0.02);
    osc3.stop(startTime + duration + 0.02);
  }

  /**
   * Expense (- खर्च): Plays Traditional Tabla (तबला थाप — "धा - धिन - धिन - ना")
   */
  public playExpenseTabla(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.02;
    // Bol 1: Dha (Bayan Ghe + Dayan Na)
    this.triggerTablaBayan(ctx, now, false);
    this.triggerTablaDayan(ctx, now, 'na');

    // Bol 2: Dhin (Bayan with wrist pitch bend + Dayan Tin)
    this.triggerTablaBayan(ctx, now + 0.16, true);
    this.triggerTablaDayan(ctx, now + 0.16, 'tin');

    // Bol 3: Dhin (Bayan + Dayan Tun)
    this.triggerTablaBayan(ctx, now + 0.32, false);
    this.triggerTablaDayan(ctx, now + 0.32, 'tun');

    // Bol 4: Crisp closing Na / Ta on Dayan rim
    this.triggerTablaDayan(ctx, now + 0.48, 'na');
  }

  // ============================================================================
  // 3. HARMONIUM (संवादिनी / हार्मोनियम) — For Account-to-Account Transfers
  // ============================================================================
  private triggerHarmoniumReedNote(
    ctx: AudioContext,
    startTime: number,
    freq: number,
    duration: number,
    peakGain = 0.12
  ) {
    // Dual brass reeds (Nar-Mada / Celeste tuning with slight +3.5 cent detune for warm acoustic beating)
    const reed1 = ctx.createOscillator();
    const reed2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    reed1.type = 'sawtooth';
    reed2.type = 'square';

    reed1.frequency.setValueAtTime(freq, startTime);
    reed2.frequency.setValueAtTime(freq * 1.0022, startTime); // Natural double-reed chorus

    // Wooden reed-chamber warm lowpass filter
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1450, startTime);
    filter.Q.setValueAtTime(1.2, startTime);

    // Smooth hand-pumped bellows attack & release envelope
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.065);
    gain.gain.setValueAtTime(peakGain * 0.92, startTime + duration * 0.72);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    const reed2Gain = ctx.createGain();
    reed2Gain.gain.setValueAtTime(0.45, startTime);

    reed1.connect(filter);
    reed2.connect(reed2Gain);
    reed2Gain.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    reed1.start(startTime);
    reed2.start(startTime);
    reed1.stop(startTime + duration + 0.03);
    reed2.stop(startTime + duration + 0.03);
  }

  /**
   * Account Transfer (खाते हस्तांतरण): Plays Marathi Harmonium (संवादिनी / हार्मोनियम सूर)
   * Warm bellows chord progression (Sa-Ga-Pa -> Re-Ma-Dha -> Sa-Ga-Pa-TaarSa)
   */
  public playTransferHarmonium(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + 0.02;
    // Sustained Sa-Pa base drone (C4 + G4)
    this.triggerHarmoniumReedNote(ctx, now, 261.63, 0.72, 0.09); // Sa
    this.triggerHarmoniumReedNote(ctx, now, 392.0, 0.72, 0.08); // Pa

    // Melodic Harmonium phrase: Ga -> Ma -> Pa -> Taar Sa
    this.triggerHarmoniumReedNote(ctx, now + 0.04, 329.63, 0.22, 0.11); // Ga
    this.triggerHarmoniumReedNote(ctx, now + 0.22, 369.99, 0.22, 0.11); // Tivra Ma (Yaman)
    this.triggerHarmoniumReedNote(ctx, now + 0.4, 392.0, 0.36, 0.12); // Pa
    this.triggerHarmoniumReedNote(ctx, now + 0.42, 523.25, 0.36, 0.1); // Taar Sa
  }

  // Backward-compatible aliases used across modules (with zero speech/repeat)
  public playRevenueTaalPakhawaj(): void {
    this.playRevenueVeena();
  }

  public playExpenseGhungrooBamboo(): void {
    this.playExpenseTabla();
  }

  public playNotificationSwarmandal(): void {
    this.playRevenueVeena();
  }
}

export const acousticEngine = new AcousticEngine();

export function buildAcousticCueToast(
  type: 'revenue' | 'expense',
  amount: number,
  categoryLabel: string,
  lang: Language
): AcousticToastCue {
  if (type === 'revenue') {
    return {
      id: `cue_${Date.now()}`,
      type: 'revenue',
      instrumentTitle:
        lang === 'mr'
          ? '🎻 सरस्वती वीणा झंकार (जमा नोंद)'
          : lang === 'hi'
          ? '🎻 सरस्वती वीणा झंकार (जमा प्रविष्टि)'
          : '🎻 Saraswati Veena Resonance (Revenue Logged)',
      bolNotation: '॥ वीणा स्वर: सा • ग • ध • सां (शुभ जमा) ॥',
      description:
        lang === 'mr'
          ? `तिजोरीत सकारात्मक भर! मधुर वीणा झंकारासह जमा नोंद पूर्ण.`
          : lang === 'hi'
          ? `तिजोरी में सकारात्मक वृद्धि! मधुर वीणा झंकार के साथ जमा दर्ज।`
          : `Vault enriched! Accompanied by auspicious Saraswati Veena strings.`,
      amount,
      categoryLabel,
    };
  }

  return {
    id: `cue_${Date.now()}`,
    type: 'expense',
    instrumentTitle:
      lang === 'mr'
        ? '🥁 तबला थाप: धा-धिन-धिन-ना (खर्च नोंद)'
        : lang === 'hi'
        ? '🥁 तबला थाप: धा-धिन-धिन-ना (खर्च प्रविष्टि)'
        : '🥁 Tabla Rhythm: Dha-Dhin-Dhin-Na (Expense Logged)',
    bolNotation: '॥ तबला बोल: धा • धिन • धिन • ना (अर्थसंयम) ॥',
    description:
        lang === 'mr'
          ? `खर्चाची जाणीवपूर्वक नोंद! पारंपरिक तबल्याच्या तालावर खर्चाची नोंद पूर्ण.`
          : lang === 'hi'
          ? `खर्च की सचेत प्रविष्टि! पारंपरिक तबले की थाप के साथ खर्च दर्ज।`
          : `Mindful outflow recorded! Accompanied by crisp traditional Tabla strokes.`,
    amount,
    categoryLabel,
  };
}
