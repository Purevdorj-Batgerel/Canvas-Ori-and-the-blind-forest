import AudioManager from "./src/AudioManager";
import CanvasManager from "./src/CanvasManager";
import InputManager from "./src/Inputs";
import ParallaxCanvas from "./src/ParallaxCanvas";
import UICanvas from "./src/UICanvas";
import WispCanvas from "./src/WispCanvas";
import VisualizerCanvas from "./src/visualizer";

import { fadeStartTime, setDimensionRatio } from "./src/globalValues";

const audioManager = new AudioManager();
const inputManager = new InputManager(audioManager);

const parallaxCanvas = new ParallaxCanvas(inputManager);
const wispCanvas = new WispCanvas(inputManager);
const visualizerCanvas = new VisualizerCanvas(audioManager.analyser);
const uiCanvas = new UICanvas(audioManager);

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
  if (fadeStartTime()) {
    uiCanvas.draw(time);
  }
  window.requestAnimationFrame(draw);
};

window.onload = () => {
  window.addEventListener("resize", () => {
    setDimensionRatio();
    canvasManager.resizeCanvases();
    canvasManager.draw();
  });
  window.addEventListener("deviceorientation", (event) => {
    inputManager.handleDeviceOrientation(event);
    parallaxCanvas.draw();
  });
  window.addEventListener("mousemove", (event) => {
    inputManager.handleMouseMove(event);
    parallaxCanvas.draw();
  });

  const surfaceCanvas = canvasManager.getCanvasElements().at(-1);
  surfaceCanvas.addEventListener("click", inputManager.handleClick);

  canvasManager.appendToDom();
  canvasManager.draw();

  draw();
};
