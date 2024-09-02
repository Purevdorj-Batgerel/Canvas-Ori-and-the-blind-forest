/**
 * Represents a canvas element with 2D drawing context.
 */
export default class Canvas {
  /**
   * Creates a new Canvas instance.
   *
   * @constructor
   * @param {CanvasRenderingContext2DSettings} [option] - Optional settings for the canvas context.
   */
  constructor(option) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", option);
  }

  /**
   * Clears the canvas content.
   */
  clear() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}
