export default class AudioManager {
  constructor() {
    this.audio = new Audio("/ori_main_theme.mp3");
    this.isSoundInitialized = false;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.minDecibels = -110;
    this.analyser.maxDecibels = -30;
    this.analyser.smoothingTimeConstant = 0.88;
  }

  async playAudio() {
    await this.audio.play();
    await this.audioCtx.resume();

    this.isSoundInitialized = true;
    const source = this.audioCtx.createMediaElementSource(this.audio);
    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }

  isMuted() {
    return this.audio.muted;
  }

  toggleMute() {
    this.audio.muted = !this.audio.muted;
  }
}
