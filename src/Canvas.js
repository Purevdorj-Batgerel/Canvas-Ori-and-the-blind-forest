export default class Canvas {
  constructor(option) {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d", option);
  }

  clear() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}
