export class AudioEngine {
  private static instance: AudioEngine;
  private audio: HTMLAudioElement;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private isInitialized = false;

  private constructor() {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.crossOrigin = 'anonymous';
  }

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public initWebAudio() {
    if (this.isInitialized) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn('Web Audio initialization error (could be user gesture requirement):', e);
    }
  }

  public async resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public getAudioElement(): HTMLAudioElement {
    return this.audio;
  }

  public loadTrack(src: string): Promise<number> {
    this.initWebAudio();
    this.resumeContext();
    this.audio.src = src;
    this.audio.load();

    return new Promise((resolve) => {
      const onLoaded = () => {
        this.audio.removeEventListener('loadedmetadata', onLoaded);
        resolve(this.audio.duration || 0);
      };
      this.audio.addEventListener('loadedmetadata', onLoaded);
    });
  }

  public play(): Promise<void> {
    this.initWebAudio();
    this.resumeContext();
    return this.audio.play();
  }

  public pause(): void {
    this.audio.pause();
  }

  public seek(seconds: number): void {
    if (Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
    }
  }

  public setVolume(vol: number): void {
    this.audio.volume = Math.max(0, Math.min(1, vol));
  }

  public setPlaybackRate(rate: number): void {
    this.audio.playbackRate = rate;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(64);
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(64);
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);
    return dataArray;
  }
}

