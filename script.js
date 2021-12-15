import { rnd2, calcTextLines, timing, calcDimensionRatio } from "./utils";

document.body.style.position = "fixed";
document.body.style.margin = 0;
document.body.style.font = "12px Montserrat";

const backCanvas = document.createElement("canvas");
const foreCanvas = document.createElement("canvas");
const uiCanvas = document.createElement("canvas");

const canvases = [backCanvas, foreCanvas, uiCanvas];

const bg_back = new Image();
const bg_mid = new Image();
const bg_fore = new Image();
bg_back.src = "./assets/bg_back_32.png";
bg_mid.src = "./assets/bg_mid_64.png";
bg_fore.src = "./assets/bg_fore_32.png";

const audio = new Audio("./assets/ori_main_theme.mp3");

const logo = new Image();
const pattern = new Image();
logo.src = "./assets/logo1.png";
pattern.src = "./assets/raster.png";

const backCtx = backCanvas.getContext("2d", { alpha: false });
const foreCtx = foreCanvas.getContext("2d");
const uiCtx = uiCanvas.getContext("2d");

const FADE_DURATION = 1000;

const SONG_TITLE = "Main Theme - Definitive Edition";
const SONG_ARTIST = "Gareth Coker";
const SONG_ALBUM = "Ori and the Blind Forest";

let mouseX = 0;
let mouseY = 0;

let analyser;
let tiltAngle = 0;
let startTime = 0;
let fadeProgress = 1;
let isSoundInitialized = false;

let minRatio = 1;

const FULLSCREEN_ICON_SIZE = 60;
const VOLUME_ICON_SIZE = 48;

const PARTICLE_COUNT = Math.floor(
  (window.innerHeight * window.innerWidth) / 40000
);
let particles = new Array(PARTICLE_COUNT);
particles.fill({});
particles = particles.map((_) => ({
  x: Math.floor(Math.random() * window.innerWidth),
  y: Math.floor(Math.random() * window.innerHeight),
  r: Math.floor(rnd2() * 100 + 6),
  angle: Math.random() * 360,
}));

const initializeStyles = (canvases) => {
  canvases.forEach((canvas, i) => {
    canvas.style.position = "absolute";
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.zIndex = i;
  });
};

const resizeCanvases = (canvases) => {
  canvases.forEach((canvas) => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
};

const handleDeviceOrientation = (event) => {
  let { beta, gamma } = event;

  if (gamma > 45) {
    gamma = 45;
  } else if (gamma < -45) {
    gamma = -45;
  }

  if (beta > 45) {
    beta = 45;
  } else if (beta < -45) {
    beta = -45;
  }

  if (window.innerHeight > window.innerWidth) {
    tiltAngle = gamma;
  } else {
    tiltAngle = beta;
  }
};

const update = () => {
  minRatio = calcDimensionRatio();
};

const draw = (time) => {
  drawBackground();
  drawForeground();
  if (startTime && fadeProgress) {
    drawUI(time);
  }
  window.requestAnimationFrame(draw);
};
const updateFlies = () => {
  particles = particles.map((p, i) => {
    p.angle += 0.01;
    p.y -= 0.02 * p.r;
    const xChange = (Math.sin(p.angle) / 4) * (p.r / 20);
    p.x += xChange;
    if (p.x > window.innerWidth + p.r * 2 || p.x < -p.r * 2 || p.y < -p.r * 2) {
      if (i % 3 > 0) {
        // 66.67% of the flakes
        return {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + p.r * 2,
          r: p.r,
          angle: p.angle,
        };
      } else {
        if (xChange > 0) {
          // Enter from the left
          return {
            x: -p.r * 2 + 1,
            y: Math.random() * window.innerHeight,
            r: p.r,
            angle: p.angle,
          };
        } else {
          // Enter from the right
          return {
            x: window.innerWidth + p.r * 2 - 1,
            y: Math.random() * window.innerHeight,
            r: p.r,
            angle: p.angle,
          };
        }
      }
    }
    return p;
  });
};

const drawFlies = () => {
  updateFlies();
  particles.forEach((f) => {
    const radGrad = foreCtx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
    const distance = Math.sqrt(
      (f.x - mouseX) * (f.x - mouseX) + (f.y - mouseY) * (f.y - mouseY)
    );
    if (distance > 100) {
      radGrad.addColorStop(0, "rgba(255,255,164,.7)");
      radGrad.addColorStop(0.4, "rgba(247,148,29,.3)");
      radGrad.addColorStop(1, "rgba(255,218,164,0)");
    } else {
      radGrad.addColorStop(
        0,
        `rgba(255,255,164,${0.7 + (0.3 * (100 - distance)) / 100})`
      );
      radGrad.addColorStop(
        0.4,
        `rgba(247,148,29,${0.3 + (0.4 * (100 - distance)) / 100})`
      );
      radGrad.addColorStop(1, "rgba(255,218,164,0)");
    }
    foreCtx.fillStyle = radGrad;
    foreCtx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
  });
};

const drawVisualizer = () => {
  if (window.innerWidth > 1599) {
    analyser.fftSize = 2048;
  } else if (window.innerWidth < 600) {
    analyser.fftSize = 512;
  } else {
    analyser.fftSize = 1024;
  }
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);
  const barWidth = window.innerWidth / bufferLength;
  let barHeight;
  let x = 0;
  foreCtx.fillStyle = "rgba(255, 255, 255,.5)";
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    foreCtx.fillRect(x, window.innerHeight - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
};

const drawTexts = () => {
  const textWidth = window.innerWidth - 40;
  let fontSize = Math.min(36, window.innerHeight / 12);
  let text = SONG_TITLE;
  uiCtx.font = `${fontSize}px Montserrat`;
  uiCtx.fillStyle = "white";
  uiCtx.textAlign = "center";
  let lines = calcTextLines(uiCtx, fontSize, text, textWidth);
  let cumulativeHeight = 0;
  let lastHeight = 0;
  lines.forEach((line) => {
    lastHeight = line.height;
    uiCtx.fillText(
      line.text.trim(),
      window.innerWidth / 2,
      window.innerHeight * 0.65 + cumulativeHeight + lastHeight
    );
  });
  cumulativeHeight += lastHeight + 4;
  fontSize = Math.min(27, (window.innerHeight / 12) * 0.75);
  uiCtx.font = `${fontSize}px Montserrat`;
  text = SONG_ALBUM;
  lines = calcTextLines(uiCtx, fontSize, text, textWidth);
  lines.forEach((line) => {
    lastHeight = line.height;
    uiCtx.fillText(
      line.text,
      window.innerWidth / 2,
      window.innerHeight * 0.65 + cumulativeHeight + lastHeight
    );
  });
  cumulativeHeight += lastHeight + 4;
  text = SONG_ARTIST;
  uiCtx.font = `bold ${fontSize}px Montserrat`;
  lines = calcTextLines(uiCtx, fontSize, text, textWidth);
  lines.forEach((line) => {
    lastHeight = line.height;
    uiCtx.fillText(
      line.text,
      window.innerWidth / 2,
      window.innerHeight * 0.65 + cumulativeHeight + lastHeight
    );
  });
};

const drawBackground = () => {
  const newWidth = Math.ceil(bg_back.naturalWidth / minRatio);
  const newHeight = Math.ceil(bg_back.naturalHeight / minRatio);

  const wOffset = (window.innerWidth - newWidth) / 2;
  const hOffset = Math.ceil((window.innerHeight - newHeight) / 2);

  backCtx.drawImage(
    bg_back,
    Math.ceil(wOffset - tiltAngle * 0.3),
    hOffset,
    newWidth,
    newHeight
  );
  backCtx.drawImage(
    bg_mid,
    Math.ceil(wOffset + tiltAngle * 0.2),
    hOffset,
    newWidth,
    newHeight
  );
  backCtx.drawImage(
    bg_fore,
    Math.ceil(wOffset + tiltAngle * 0.7),
    hOffset,
    newWidth,
    newHeight
  );
};

const drawForeground = () => {
  foreCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawFlies();
  if (analyser) {
    drawVisualizer();
  }
};

const drawUI = (time) => {
  uiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  const logoRatio = minRatio + 0.5;
  const logoWidth = logo.naturalWidth / logoRatio;
  const logoHeight = logo.naturalHeight / logoRatio;
  const logoWOffset = (window.innerWidth - logoWidth) / 2;
  const logoHOffset = -50 / logoRatio;
  uiCtx.drawImage(logo, logoWOffset, logoHOffset, logoWidth, logoHeight);

  const radius = Math.max(window.innerWidth, window.innerHeight) / 2;
  uiCtx.save();
  const radGrad = uiCtx.createRadialGradient(
    radius,
    radius,
    0,
    radius,
    radius,
    radius * 1.4
  );
  radGrad.addColorStop(0, "transparent");
  radGrad.addColorStop(0.7, "transparent");
  radGrad.addColorStop(0.95, "black");
  radGrad.addColorStop(1, "black");
  uiCtx.fillStyle = radGrad;
  const hr = window.innerHeight / window.innerWidth;
  const wr = window.innerWidth / window.innerHeight;
  uiCtx.setTransform(Math.min(1, wr), 0, 0, Math.min(1, hr), 0, 0);
  uiCtx.fillRect(0, 0, radius * 2, radius * 2);
  uiCtx.restore();

  if (time) {
    let timeFraction = (time - startTime) / FADE_DURATION;
    if (timeFraction < 0) {
      return;
    } else if (timeFraction > 1) {
      timeFraction = 1;
      fadeProgress = 0;
    } else {
      fadeProgress = 1 - timing(timeFraction);
    }
  }

  uiCtx.save();
  uiCtx.globalAlpha = fadeProgress;
  uiCtx.fillStyle = "white";

  const TEMP_SCALE = 5 + minRatio;
  uiCtx.scale(1 / TEMP_SCALE, 1 / TEMP_SCALE);
  uiCtx.translate(
    ((window.innerWidth - 75) * TEMP_SCALE) / 2,
    window.innerHeight * 0.85 * TEMP_SCALE
  );

  uiCtx.fill(
    new Path2D(
      "M319 188h-1c-9 0-18 3-24 9-6-15-20-26-36-26-10 0-20 4-27 11-6-13-19-21-34-21-8-1-16 2-22 7V76c0-23-18-41-39-41S98 53 98 76v182l-10-12c-10-11-23-18-37-19-15-1-28 3-39 13l-9 8c-3 2-4 6-2 9l88 169c16 30 46 50 79 50h99v-1c50 0 90-43 90-96V228c0-23-17-40-38-40zm22 135v56c0 44-34 81-75 81h-98c-27 0-52-16-65-42L18 256l5-4a36 36 0 0152 4l25 30a8 8 0 0014-5V76c0-14 10-25 22-25s23 11 23 25v178a8 8 0 0016 0v-54c0-13 10-23 22-23 13 0 23 10 23 24v48a8 8 0 0016 0v-38c0-13 9-24 22-24 12 0 22 11 22 24v36a8 8 0 0016 0v-19c0-14 10-24 22-24h1c12 0 22 10 22 24v95zm0 0"
    )
  );
  uiCtx.fill(
    new Path2D(
      "M73 79c4 0 8-3 8-8a55 55 0 01110 0 8 8 0 0016 0 71 71 0 00-142 0c0 5 3 8 8 8zm0 0"
    )
  );

  uiCtx.restore();

  uiCtx.save();
  uiCtx.globalAlpha = 1 - fadeProgress;
  drawTexts();
  uiCtx.save();
  uiCtx.fillStyle = "white";
  uiCtx.scale(2, 2);
  uiCtx.translate(24 / 2, 24 / 2);
  if (audio.muted) {
    uiCtx.fill(
      new Path2D(
        "M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
      )
    );
  } else {
    uiCtx.fill(
      new Path2D(
        "M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
      )
    );
  }
  uiCtx.restore();
  uiCtx.restore();

  uiCtx.save();
  uiCtx.fillStyle = "white";
  uiCtx.scale(2.5, 2.5);
  uiCtx.translate(
    (window.innerWidth - 16 - FULLSCREEN_ICON_SIZE) / 2.5,
    16 / 2.5
  );

  if (document.fullscreenElement) {
    uiCtx.fill(
      new Path2D(
        "M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3"
      )
    );
  } else {
    uiCtx.fill(
      new Path2D(
        "M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
      )
    );
  }
  uiCtx.restore();

  uiCtx.save();
  const ctxPattern = uiCtx.createPattern(pattern, "repeat");
  uiCtx.fillStyle = ctxPattern;
  uiCtx.globalAlpha = 0.5;
  uiCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
  uiCtx.restore();
};

const playAudio = () => {
  startTime = performance.now();

  const playPromise = audio.play();
  if (playPromise) {
    playPromise
      .then((_) => {
        isSoundInitialized = true;
        const audioCtx = new (window.AudioContext ||
          window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.minDecibels = -110;
        analyser.maxDecibels = -30;
        analyser.smoothingTimeConstant = 0.88;
        const source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      })
      .catch((error) => {
        console.log(error);
      });
  }
};

const clickHandler = (event) => {
  const { clientX, clientY } = event;

  if (
    window.innerWidth - FULLSCREEN_ICON_SIZE - 16 < clientX &&
    clientX < window.innerWidth - 16 &&
    clientY > 16 &&
    clientY < 16 + FULLSCREEN_ICON_SIZE
  ) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  } else if (
    16 < clientX &&
    clientX < 16 + VOLUME_ICON_SIZE &&
    16 < clientY &&
    clientY < 16 + VOLUME_ICON_SIZE
  ) {
    audio.muted = !audio.muted;
    drawUI();
  } else {
    if (!isSoundInitialized) {
      playAudio();
    }
  }
};

window.onload = () => {
  document.body.appendChild(backCanvas);
  document.body.appendChild(foreCanvas);
  document.body.appendChild(uiCanvas);

  document.fonts.ready.then(function () {
    drawUI();
  });

  uiCanvas.addEventListener("click", clickHandler);
  window.addEventListener("resize", () => {
    resizeCanvases(canvases);
    update();
    drawUI();
  });

  if (navigator.maxTouchPoints) {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
  } else {
    window.addEventListener("mousemove", (evt) => {
      mouseX = evt.x;
      mouseY = evt.y;

      const angle = (mouseX * 100) / window.innerWidth - 50;

      handleDeviceOrientation({ beta: angle, gamma: angle });
    });
  }

  initializeStyles(canvases);
  resizeCanvases(canvases);

  update();
  draw();
};
