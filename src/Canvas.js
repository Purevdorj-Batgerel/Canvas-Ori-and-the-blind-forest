/**
 * Represents a canvas element with 2D drawing context.
 * @class
 */
export default class Canvas {
  /**
   * Creates a new Canvas instance.
   *
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

  /**
   * Draw on the canvas.
   * @abstract
   */
  draw() {
    throw new Error("Must be implemented by subclass!");
  }
}
