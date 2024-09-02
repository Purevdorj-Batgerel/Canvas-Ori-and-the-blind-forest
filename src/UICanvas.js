import Canvas from "./Canvas";
import { easeInOutQuad } from "./animation/timings";
import { dimensionRatio, fadeStartTime } from "./globalValues";

const FADE_DURATION = 1000;
const FULLSCREEN_ICON_SIZE = 60;

const SONG_TITLE = "Main Theme - Definitive Edition";
const SONG_ARTIST = "Gareth Coker";
const SONG_ALBUM = "Ori and the Blind Forest";

export function calcTextLines(ctx, fontSize, text, maxWidth) {
  const lines = [];
  const words = text.split(" ");
  let line = "";
  let height = 0;
  const heightModifier = 1.4;

  for (const word of words) {
    const lineTest = `${line}${word} `;
    if (ctx.measureText(lineTest).width > maxWidth) {
      height = (lines.length + 1) * fontSize * heightModifier;
      lines.push({ text: line, height });
      line = `${word} `;
    } else {
      line = lineTest;
    }
  }

  if (line.length > 0) {
    height = (lines.length + 1) * fontSize * heightModifier;
    lines.push({ text: line.trim(), height });
  }

  return lines;
}

export default class UICanvas extends Canvas {
  constructor(audioManager) {
    super();
    this.audioManager = audioManager;

    this.fadeProgress = 0;

    this.logo = new Image();
    this.logo.src = "./logo.webp";

    this.pattern = new Image();
    this.pattern.src = "./raster.webp";
  }

  draw(time) {
    this.clear();

    this.drawLogo();
    this.drawGradient();

    if (time) {
      const timeFraction = (time - fadeStartTime()) / FADE_DURATION;
      if (timeFraction < 0) {
        return;
      }
      if (timeFraction > 1) {
        this.fadeProgress = 1;
      } else {
        this.fadeProgress = easeInOutQuad(timeFraction);
      }
    }

    if (this.fadeProgress) {
      this.drawVolumeIcon(this.fadeProgress);
    }

    this.drawHandIcon(this.fadeProgress);
    this.drawFullScreenIcon();
    this.drawPattern();
  }

  drawLogo() {
    const logoRatio = dimensionRatio() + 0.5;
    const logoWidth = this.logo.naturalWidth / logoRatio;
    const logoHeight = this.logo.naturalHeight / logoRatio;
    const logoWOffset = (window.innerWidth - logoWidth) / 2;
    const logoHOffset = -50 / logoRatio;

    this.ctx.drawImage(
      this.logo,
      logoWOffset,
      logoHOffset,
      logoWidth,
      logoHeight,
    );
  }

  drawGradient() {
    // background-image: radial-gradient(transparent 70%, black 95%, black 100%)
    this.ctx.save();
    const radius = Math.max(window.innerWidth, window.innerHeight) / 2;
    const radGrad = this.ctx.createRadialGradient(
      radius,
      radius,
      0,
      radius,
      radius,
      radius * Math.sqrt(2),
    );

    radGrad.addColorStop(0, "transparent");
    radGrad.addColorStop(0.7, "transparent");
    radGrad.addColorStop(0.95, "black");
    radGrad.addColorStop(1, "black");
    this.ctx.fillStyle = radGrad;
    const hr = window.innerHeight / window.innerWidth;
    const wr = window.innerWidth / window.innerHeight;
    this.ctx.setTransform(Math.min(1, wr), 0, 0, Math.min(1, hr), 0, 0);
    this.ctx.fillRect(0, 0, radius * 2, radius * 2);
    this.ctx.restore();
  }

  drawHandIcon(fadeProgress) {
    this.ctx.save();
    this.ctx.globalAlpha = 1 - fadeProgress;
    this.ctx.fillStyle = "white";

    const TEMP_SCALE = 5 + dimensionRatio();
    this.ctx.scale(1 / TEMP_SCALE, 1 / TEMP_SCALE);
    this.ctx.translate(
      ((window.innerWidth - 75) * TEMP_SCALE) / 2,
      window.innerHeight * 0.85 * TEMP_SCALE,
    );

    this.ctx.fill(
      new Path2D(
        "M319 188h-1c-9 0-18 3-24 9-6-15-20-26-36-26-10 0-20 4-27 11-6-13-19-21-34-21-8-1-16 2-22 7V76c0-23-18-41-39-41S98 53 98 76v182l-10-12c-10-11-23-18-37-19-15-1-28 3-39 13l-9 8c-3 2-4 6-2 9l88 169c16 30 46 50 79 50h99v-1c50 0 90-43 90-96V228c0-23-17-40-38-40zm22 135v56c0 44-34 81-75 81h-98c-27 0-52-16-65-42L18 256l5-4a36 36 0 0152 4l25 30a8 8 0 0014-5V76c0-14 10-25 22-25s23 11 23 25v178a8 8 0 0016 0v-54c0-13 10-23 22-23 13 0 23 10 23 24v48a8 8 0 0016 0v-38c0-13 9-24 22-24 12 0 22 11 22 24v36a8 8 0 0016 0v-19c0-14 10-24 22-24h1c12 0 22 10 22 24v95zm0 0",
      ),
    );
    this.ctx.fill(
      new Path2D(
        "M73 79c4 0 8-3 8-8a55 55 0 01110 0 8 8 0 0016 0 71 71 0 00-142 0c0 5 3 8 8 8zm0 0",
      ),
    );
    this.ctx.restore();
  }

  drawVolumeIcon(fadeProgress) {
    this.ctx.save();
    this.ctx.globalAlpha = fadeProgress;
    this.drawTexts();
    this.ctx.save();
    this.ctx.fillStyle = "white";
    this.ctx.scale(2, 2);
    this.ctx.translate(24 / 2, 24 / 2);
    if (this.audioManager.isMuted()) {
      this.ctx.fill(
        new Path2D(
          "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z",
        ),
      );
    } else {
      this.ctx.fill(
        new Path2D(
          "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z",
        ),
      );
    }
    this.ctx.restore();
    this.ctx.restore();
  }

  drawFullScreenIcon() {
    this.ctx.save();
    this.ctx.fillStyle = "white";
    this.ctx.scale(2.5, 2.5);
    this.ctx.translate(
      (window.innerWidth - 16 - FULLSCREEN_ICON_SIZE) / 2.5,
      16 / 2.5,
    );

    if (document.fullscreenElement) {
      this.ctx.fill(
        new Path2D(
          "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3",
        ),
      );
    } else {
      this.ctx.fill(
        new Path2D(
          "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z",
        ),
      );
    }
    this.ctx.restore();
  }

  drawTexts() {
    let cumulativeHeight = 0;
    let lastHeight = 0;

    function renderText(lines) {
      for (const line of lines) {
        lastHeight = line.height;
        this.ctx.fillText(
          line.text.trim(),
          window.innerWidth / 2,
          window.innerHeight * 0.65 + cumulativeHeight + lastHeight,
        );
      }
      cumulativeHeight += lastHeight + 4;
    }

    const textWidth = window.innerWidth - 40;
    this.ctx.fillStyle = "white";
    this.ctx.textAlign = "center";

    let fontSize = Math.min(36, window.innerHeight / 12);
    this.ctx.font = `${fontSize}px Verdana`;
    renderText.call(
      this,
      calcTextLines(this.ctx, fontSize, SONG_TITLE, textWidth),
    );

    fontSize = Math.min(27, (window.innerHeight / 12) * 0.75);
    this.ctx.font = `${fontSize}px Verdana`;
    renderText.call(
      this,
      calcTextLines(this.ctx, fontSize, SONG_ALBUM, textWidth),
    );

    this.ctx.font = `bold ${fontSize}px Verdana`;
    renderText.call(
      this,
      calcTextLines(this.ctx, fontSize, SONG_ARTIST, textWidth),
    );
  }

  drawPattern() {
    this.ctx.save();
    this.ctx.fillStyle = this.ctx.createPattern(this.pattern, "repeat");
    this.ctx.globalAlpha = 0.5;
    this.ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    this.ctx.restore();
  }
}
