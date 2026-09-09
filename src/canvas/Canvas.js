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
    this.dpr = 1;
  }

  /**
   * Resizes the canvas backing store to the window size scaled by the device
   * pixel ratio, while keeping its CSS (logical) size at the window size, so
   * drawing stays sharp on high-density screens without changing any of the
   * logical-pixel coordinates used elsewhere.
   *
   * @param {number} [devicePixelRatio] - The device pixel ratio to render at.
   */
  resize(devicePixelRatio = window.devicePixelRatio || 1) {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.dpr = devicePixelRatio;
    this.canvas.width = width * devicePixelRatio;
    this.canvas.height = height * devicePixelRatio;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
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
