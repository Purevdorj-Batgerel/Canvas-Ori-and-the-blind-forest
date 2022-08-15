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
    this.getCanvasElements().forEach((canvas) =>
      document.body.appendChild(canvas)
    );
  }

  draw() {
    this.canvases.forEach((canvas) => canvas.draw());
  }

  resizeCanvases() {
    this.getCanvasElements().forEach((canvas) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }
}
