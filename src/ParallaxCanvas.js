import Canvas from "./Canvas";
import { dimensionRatio, inputManager } from "./globalValues";

/**
 * A canvas class for parallax tilt background effects.
 *
 * @extends Canvas
 */
export default class ParallaxCanvas extends Canvas {
  /**
   * @constructor
   */
  constructor() {
    super({ alpha: false });

    this.bg_back = new Image();
    this.bg_mid = new Image();
    this.bg_fore = new Image();

    this.bg_back.src = "./bg_back_32.webp";
    this.bg_mid.src = "./bg_mid_64.webp";
    this.bg_fore.src = "./bg_fore_32.webp";
  }

  /**
   * Draws the parallax background images based on the tilt angle.
   */
  draw() {
    const newWidth = Math.ceil(this.bg_back.naturalWidth / dimensionRatio());
    const newHeight = Math.ceil(this.bg_back.naturalHeight / dimensionRatio());

    const wOffset = (window.innerWidth - newWidth) / 2;
    const hOffset = Math.ceil((window.innerHeight - newHeight) / 2);

    this.ctx.drawImage(
      this.bg_back,
      Math.ceil(wOffset - inputManager.tiltAngle * 0.3), // negative angle
      hOffset,
      newWidth,
      newHeight,
    );
    this.ctx.drawImage(
      this.bg_mid,
      Math.ceil(wOffset + inputManager.tiltAngle * 0.2), // positive angle
      hOffset,
      newWidth,
      newHeight,
    );
    this.ctx.drawImage(
      this.bg_fore,
      Math.ceil(wOffset + inputManager.tiltAngle * 0.7), // exaggerated positive angle
      hOffset,
      newWidth,
      newHeight,
    );
  }
}
