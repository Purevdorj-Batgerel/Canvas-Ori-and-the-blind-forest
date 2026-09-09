import Canvas from "./Canvas.js";

const FFT_SIZE_LARGE = 2048;
const FFT_SIZE_MEDIUM = 1024;
const FFT_SIZE_SMALL = 512;
const LARGE_SCREEN_WIDTH = 1599;
const SMALL_SCREEN_WIDTH = 600;

/**
 * Picks an FFT size appropriate for the screen width, trading frequency
 * resolution for performance on smaller screens.
 *
 * @param {number} width - The current viewport width.
 * @returns {number} The FFT size to use for the analyser.
 */
export function calcFftSize(width) {
  if (width > LARGE_SCREEN_WIDTH) {
    return FFT_SIZE_LARGE;
  }
  if (width < SMALL_SCREEN_WIDTH) {
    return FFT_SIZE_SMALL;
  }
  return FFT_SIZE_MEDIUM;
}

/**
 * A canvas class for visualizing audio frequency data.
 * @class
 * @extends Canvas
 */
export default class VisualizerCanvas extends Canvas {
  /**
   * Creates a new VisualizerCanvas instance.
   *
   * @param {AnalyserNode} analyser - An instance of the AnalyserNode class for audio analysis.
   * @extends Canvas
   */
  constructor(analyser) {
    super();
    this.analyser = analyser;
    this.dataArray = null;
  }

  /**
   * Draws the audio frequency visualization on the canvas.
   */
  draw() {
    this.clear();

    const fftSize = calcFftSize(window.innerWidth);
    if (this.analyser.fftSize !== fftSize) {
      this.analyser.fftSize = fftSize;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    if (!this.dataArray || this.dataArray.length !== bufferLength) {
      this.dataArray = new Uint8Array(bufferLength);
    }
    this.analyser.getByteFrequencyData(this.dataArray);

    const barWidth = window.innerWidth / bufferLength;
    let x = 0;
    this.ctx.fillStyle = "rgba(255, 255, 255,.5)";

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = this.dataArray[i];
      this.ctx.fillRect(x, window.innerHeight - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }
}
