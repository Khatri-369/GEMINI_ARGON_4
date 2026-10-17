class ProceduralSoundEngine {
  private ctx: AudioContext | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private masterVolume = 0.7;
  private sfxVolume = 0.8;
  private sirenPhase = 0;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, _music: number, sfx: number) {
    this.masterVolume = master;
    this.sfxVolume = sfx;
  }

  public updateEngineSound(speed: number, isDriving: boolean, nitroActive: boolean) {
    if (!isDriving) {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.1);
      }
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    if (!this.engineOsc || !this.engineGain) {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 55;
      this.engineGain.gain.value = 0.001;
      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    }

    const baseFreq = 48 + Math.abs(speed) * (nitroActive ? 4.2 : 3.1);
    const targetGain = Math.min(0.12, (0.03 + Math.abs(speed) * 0.002) * this.masterVolume * this.sfxVolume);

    this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
    this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.08);
  }

  public updatePoliceSiren(wantedLevel: number, dt: number) {
    if (wantedLevel < 2) {
      if (this.sirenGain && this.ctx) {
        this.sirenGain.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.15);
      }
      return;
    }

    this.initContext();
    if (!this.ctx) return;

    if (!this.sirenOsc || !this.sirenGain) {
      this.sirenOsc = this.ctx.createOscillator();
      this.sirenGain = this.ctx.createGain();
      this.sirenOsc.type = 'triangle';
      this.sirenOsc.frequency.value = 650;
      this.sirenGain.gain.value = 0.001;
      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);
      this.sirenOsc.start();
    }

    this.sirenPhase += dt * 4.5;
    const freq = 680 + Math.sin(this.sirenPhase) * 240;
    const gain = 0.045 * this.masterVolume * this.sfxVolume;

    this.sirenOsc.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.04);
    this.sirenGain.gain.setTargetAtTime(gain, this.ctx.currentTime, 0.1);
  }

  public playGunshot() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.11);

    gain.gain.setValueAtTime(0.25 * this.masterVolume * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playCrash() {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(22, now + 0.22);

    gain.gain.setValueAtTime(0.22 * this.masterVolume * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  }

  public playMissionChime(success = true) {
    this.initContext();
    if (!this.ctx) return;

    const notes = success ? [523.25, 659.25, 783.99, 1046.5] : [392.0, 349.23, 311.13];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const now = this.ctx.currentTime + idx * 0.11;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.16 * this.masterVolume * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.29);
    });
  }

  public playUiClick() {
    this.initContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    gain.gain.setValueAtTime(0.08 * this.masterVolume * this.sfxVolume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundEngine = new ProceduralSoundEngine();