/**
 * Manages audio playback using the Web Audio API.
 * @class
 */
export default class AudioManager {
  /**
   * Creates a new AudioManager instance.
   */
  constructor() {
    this.audio = new Audio("./ori_main_theme.mp3");
    this.isSoundInitialized = false;

    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.minDecibels = -110;
    this.analyser.maxDecibels = -30;
    this.analyser.smoothingTimeConstant = 0.88;
  }

  /**
   * Plays the audio and initializes the audio context.
   *
   * @returns {Promise<void>} A promise that resolves when the audio starts playing.
   */
  async playAudio() {
    await this.audio.play();
    await this.audioCtx.resume();

    this.isSoundInitialized = true;
    const source = this.audioCtx.createMediaElementSource(this.audio);
    source.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);
  }

  /**
   * Checks if the audio is currently muted.
   *
   * @returns {boolean} True if the audio is muted, false otherwise.
   */
  isMuted() {
    return this.audio.muted;
  }

  /**
   * Toggles the mute state of the audio.
   */
  toggleMute() {
    this.audio.muted = !this.audio.muted;
  }
}
