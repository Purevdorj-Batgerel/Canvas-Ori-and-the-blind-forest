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
bg_mid.src = "./assets/bg_mid_32.png";
bg_fore.src = "./assets/bg_fore_32.png";

const audio = new Audio("./assets/ori_main_theme.mp3");

const logo = new Image();
const pattern = new Image();
const clickIcon = new Image();
const volumeUpIcon = new Image();
const volumeOffIcon = new Image();
const fullScreenIcon = new Image();
const fullScreenExitIcon = new Image();
logo.src = "./assets/logo1.png";
pattern.src = "./assets/raster.png";
clickIcon.src = "./assets/click.svg";
volumeUpIcon.src = "./assets/volumeUp.svg";
volumeOffIcon.src = "./assets/volumeOff.svg";
fullScreenIcon.src = "./assets/fullscreen.svg";
fullScreenExitIcon.src = "./assets/fullscreenExit.svg";

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

  const clickRatio = minRatio + 1;
  const clickWidth = clickIcon.naturalWidth / clickRatio;
  const clickHeight = clickIcon.naturalHeight / clickRatio;
  const clickWOffset = (window.innerWidth - clickWidth) / 2 - 5;
  const clickHOffset = window.innerHeight * 0.86;

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

  uiCtx.drawImage(
    clickIcon,
    Math.ceil(clickWOffset),
    Math.ceil(clickHOffset),
    Math.ceil(clickWidth),
    Math.ceil(clickHeight)
  );
  uiCtx.restore();

  uiCtx.save();
  uiCtx.globalAlpha = 1 - fadeProgress;
  drawTexts();
  if (audio.muted) {
    uiCtx.drawImage(
      volumeOffIcon,
      24,
      24,
      volumeOffIcon.width,
      volumeOffIcon.height
    );
  } else {
    uiCtx.drawImage(
      volumeUpIcon,
      24,
      24,
      volumeUpIcon.width,
      volumeUpIcon.height
    );
  }
  uiCtx.restore();

  if (document.fullscreenElement) {
    uiCtx.drawImage(
      fullScreenExitIcon,
      window.innerWidth - fullScreenIcon.width - 16,
      16,
      fullScreenIcon.width,
      fullScreenIcon.height
    );
  } else {
    uiCtx.drawImage(
      fullScreenIcon,
      window.innerWidth - fullScreenIcon.width - 16,
      16,
      fullScreenIcon.width,
      fullScreenIcon.height
    );
  }

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
    window.innerWidth - fullScreenIcon.width - 16 < clientX &&
    clientX < window.innerWidth - 16 &&
    clientY > 16 &&
    clientY < 16 + fullScreenIcon.height
  ) {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  } else if (
    16 < clientX &&
    clientX < 16 + volumeUpIcon.width &&
    16 < clientY &&
    clientY < 16 + volumeUpIcon.height
  ) {
    console.log("VOLUME");
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

  if (!navigator.userAgentData.mobile) {
    window.addEventListener("mousemove", (evt) => {
      mouseX = evt.x;
      mouseY = evt.y;

      const angle = (mouseX * 100) / window.innerWidth - 50;

      handleDeviceOrientation({ beta: angle, gamma: angle });
    });
  } else {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
  }

  initializeStyles(canvases);
  resizeCanvases(canvases);

  update();
  draw();
};
