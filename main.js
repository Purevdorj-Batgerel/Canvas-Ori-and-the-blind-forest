import CanvasManager from "./src/CanvasManager.js";
import {
  ParallaxCanvas,
  UICanvas,
  VisualizerCanvas,
  WispCanvas,
} from "./src/canvas/index.js";
import {
  audioManager,
  inputManager,
  setDimensionRatio,
} from "./src/globalValues.js";
import {
  isDeviceOrientationPermissionRequired,
  requestDeviceOrientationPermission,
} from "./src/Inputs.js";
import { waitForImages } from "./src/loadAssets.js";
import { prefersReducedMotion } from "./src/utils.js";

const reducedMotion = prefersReducedMotion();

const parallaxCanvas = new ParallaxCanvas();
const wispCanvas = new WispCanvas();
const visualizerCanvas = new VisualizerCanvas(audioManager.analyser);
const uiCanvas = new UICanvas();

const canvasManager = new CanvasManager(
  parallaxCanvas,
  wispCanvas,
  visualizerCanvas,
  uiCanvas,
);

const draw = (time) => {
  wispCanvas.draw();
  if (audioManager.isSoundInitialized) {
    visualizerCanvas.draw();
  }
  uiCanvas.draw(time);
  window.requestAnimationFrame(draw);
};

const handleDeviceOrientation = (event) => {
  inputManager.handleDeviceOrientation(event);
  parallaxCanvas.draw();
};

let motionPermissionRequested = false;

const enableDeviceOrientationIfNeeded = async () => {
  if (reducedMotion || motionPermissionRequested) {
    return;
  }
  motionPermissionRequested = true;

  const granted = await requestDeviceOrientationPermission();
  if (granted) {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
  }
};

window.onload = async () => {
  window.addEventListener("resize", () => {
    setDimensionRatio();
    canvasManager.resizeCanvases();
    uiCanvas.markDirty();
    canvasManager.draw();
  });

  // Platforms without the permission API (desktop, Android) can listen right
  // away; iOS 13+ Safari needs a user-gesture-triggered permission request first.
  if (!reducedMotion && !isDeviceOrientationPermissionRequired()) {
    window.addEventListener("deviceorientation", handleDeviceOrientation);
  }

  if (!reducedMotion) {
    window.addEventListener("mousemove", (event) => {
      inputManager.handleMouseMove(event);
      parallaxCanvas.draw();
    });
  }

  window.addEventListener("keydown", (event) => {
    inputManager.handleKeyDown(event);
    uiCanvas.markDirty();
  });

  const surfaceCanvas = canvasManager.getCanvasElements().at(-1);
  surfaceCanvas.addEventListener("click", (event) => {
    inputManager.handleClick(event);
    uiCanvas.markDirty();
    enableDeviceOrientationIfNeeded();
  });

  await waitForImages([
    parallaxCanvas.bg_back,
    parallaxCanvas.bg_mid,
    parallaxCanvas.bg_fore,
    uiCanvas.logo,
    uiCanvas.pattern,
  ]);

  canvasManager.appendToDom();
  canvasManager.draw();

  document.getElementById("loading-screen")?.remove();

  draw();
};
