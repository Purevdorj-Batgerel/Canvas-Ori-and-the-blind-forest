export default class CanvasManager {
  constructor(...canvases) {
    this.canvases = canvases;

    this.canvases
      .map((canvas) => canvas.canvas)
      .forEach((canvas, i) => {
        canvas.style.position = "absolute";
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = i;
      });

    this.resizeCanvases();
  }

  getCanvasElements() {
    return this.canvases.map((canvas) => canvas.canvas);
  }

  appendToDom() {
    for (const canvas of this.getCanvasElements()) {
      document.body.appendChild(canvas);
    }
  }

  draw() {
    for (const canvas of this.canvases) {
      canvas.draw();
    }
  }

  resizeCanvases() {
    for (const canvas of this.getCanvasElements()) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  }
}
