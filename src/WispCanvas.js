import Canvas from "./Canvas";
import { gaussianRand } from "./utils";

export default class WispCanvas extends Canvas {
  constructor(inputManager) {
    super();

    this.inputManager = inputManager;

    const wispCount = Math.floor(
      (window.innerHeight * window.innerWidth) / 40000,
    );

    this.wisps = new Array(wispCount);

    for (let i = 0; i < wispCount; i++) {
      this.wisps.push({
        x: Math.floor(Math.random() * window.innerWidth),
        y: Math.floor(Math.random() * window.innerHeight),
        radius: Math.floor(gaussianRand() * 100 + 6),
        angle: Math.random() * 360,
      });
    }
  }

  update() {
    this.wisps.forEach((wisp, index) => {
      const xChange = (Math.sin(wisp.angle) * wisp.radius) / 100;

      wisp.angle += 0.01;
      wisp.y -= 0.02 * wisp.radius;
      wisp.x += xChange;

      if (
        wisp.x > window.innerWidth + wisp.radius * 2 ||
        wisp.x < -wisp.radius * 2 ||
        wisp.y < -wisp.radius * 2
      ) {
        if (index % 3) {
          // 66.67% of the flakes
          wisp.x = Math.random() * window.innerWidth;
          wisp.y = window.innerHeight + wisp.radius * 2;
        } else {
          if (xChange > 0) {
            // Enter from the left
            wisp.x = -wisp.radius * 2 + 1;
            wisp.y = Math.random() * window.innerHeight;
          } else {
            // Enter from the right
            wisp.x = window.innerWidth + wisp.radius * 2 - 1;
            wisp.y = Math.random() * window.innerHeight;
          }
        }
      }
    });
  }

  draw() {
    this.clear();
    this.update();
    const { mouseX, mouseY } = this.inputManager;

    for (const wisp of this.wisps) {
      if (wisp) {
        const radGrad = this.ctx.createRadialGradient(
          wisp.x,
          wisp.y,
          0,
          wisp.x,
          wisp.y,
          wisp.radius,
        );
        const distance = Math.sqrt(
          (wisp.x - mouseX) * (wisp.x - mouseX) +
            (wisp.y - mouseY) * (wisp.y - mouseY),
        );
        if (distance > 100) {
          radGrad.addColorStop(0, "rgba(255,255,164,.7)");
          radGrad.addColorStop(0.4, "rgba(247,148,29,.3)");
          radGrad.addColorStop(1, "rgba(255,218,164,0)");
        } else {
          radGrad.addColorStop(
            0,
            `rgba(255,255,164,${0.7 + (0.3 * (100 - distance)) / 100})`,
          );
          radGrad.addColorStop(
            0.4,
            `rgba(247,148,29,${0.3 + (0.4 * (100 - distance)) / 100})`,
          );
          radGrad.addColorStop(1, "rgba(255,218,164,0)");
        }
        this.ctx.fillStyle = radGrad;
        this.ctx.fillRect(
          wisp.x - wisp.radius,
          wisp.y - wisp.radius,
          wisp.radius * 2,
          wisp.radius * 2,
        );
      }
    }
  }
}
