import Canvas from "./Canvas";
import { dimensionRatio } from "./globalValues";

export default class ParallaxCanvas extends Canvas {
  constructor(inputManager) {
    super({ alpha: false });

    this.inputManager = inputManager;

    this.bg_back = new Image();
    this.bg_mid = new Image();
    this.bg_fore = new Image();

    this.bg_back.src = "./bg_back_32.png";
    this.bg_mid.src = "./bg_mid_64.png";
    this.bg_fore.src = "./bg_fore_32.png";
  }

  draw() {
    const newWidth = Math.ceil(this.bg_back.naturalWidth / dimensionRatio());
    const newHeight = Math.ceil(this.bg_back.naturalHeight / dimensionRatio());

    const wOffset = (window.innerWidth - newWidth) / 2;
    const hOffset = Math.ceil((window.innerHeight - newHeight) / 2);

    this.ctx.drawImage(
      this.bg_back,
      Math.ceil(wOffset - this.inputManager.tiltAngle * 0.3),
      hOffset,
      newWidth,
      newHeight
    );
    this.ctx.drawImage(
      this.bg_mid,
      Math.ceil(wOffset + this.inputManager.tiltAngle * 0.2),
      hOffset,
      newWidth,
      newHeight
    );
    this.ctx.drawImage(
      this.bg_fore,
      Math.ceil(wOffset + this.inputManager.tiltAngle * 0.7),
      hOffset,
      newWidth,
      newHeight
    );
  }
}
