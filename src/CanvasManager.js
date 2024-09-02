import Canvas from "./canvas/Canvas";

/**
 * CanvasManager class
 *
 * @class
 */
export default class CanvasManager {
  /**
   * Initializes a collection of Canvas objects.
   *
   * @param {...HTMLCanvasElement} canvases - A variable number of Canvas objects.
   */
  constructor(...canvases) {
    this.canvases = canvases.filter((canvas) => canvas instanceof Canvas);

    if (this.canvases.length !== canvases.length) {
      throw new Error(
        "Invalid input: One or more arguments are not Canvas objects.",
      );
    }

    for (const canvas of this.canvases) {
      canvas.canvas.style.position = "absolute";
      canvas.canvas.style.top = 0;
      canvas.canvas.style.left = 0;
      canvas.canvas.style.zIndex = this.canvases.indexOf(canvas); // Set zIndex based on canvas order
    }

    this.resizeCanvases();
  }

  /**
   * Retrieves the underlying HTMLCanvasElement objects from the stored canvases.
   *
   * @returns {HTMLCanvasElement[]} An array containing the actual canvas elements from the collection.
   */
  getCanvasElements() {
    return this.canvases.map((canvas) => canvas.canvas);
  }

  /**
   * Appends the managed canvases to the document body.
   */
  appendToDom() {
    for (const canvas of this.getCanvasElements()) {
      document.body.appendChild(canvas);
    }
  }

  /**
   * Calls the `draw()` method on each managed canvas, triggering their rendering.
   */
  draw() {
    for (const canvas of this.canvases) {
      canvas.draw();
    }
  }

  /**
   * Resizes all managed canvases to match the window dimensions.
   */
  resizeCanvases() {
    for (const canvas of this.getCanvasElements()) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
}
