import CanvasManager from "./src/CanvasManager";
import InputManager from "./src/Inputs";
import ParallaxCanvas from "./src/ParallaxCanvas";
import UICanvas from "./src/UICanvas";
import AudioManager from "./src/AudioManager";
import VisualizerCanvas from "./src/visualizer";
import WispCanvas from "./src/WispCanvas";

import { fadeStartTime, setDimensionRatio } from "./src/globalValues";

document.body.style.position = "fixed";
document.body.style.margin = 0;
document.body.style.font = "12px Verdana";

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
  uiCanvas
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

// window.onload = () => {
//   window.addEventListener("resize", () => {
//     setDimensionRatio();
//     canvasManager.resizeCanvases();
//     canvasManager.draw();
//   });
//   window.addEventListener("deviceorientation", (event) => {
//     inputManager.handleDeviceOrientation(event);
//     parallaxCanvas.draw();
//   });
//   window.addEventListener("mousemove", (event) => {
//     inputManager.handleMouseMove(event);
//     parallaxCanvas.draw();
//   });

//   const topMostCanvas = canvasManager.getCanvasElements().at(-1);
//   topMostCanvas.addEventListener("click", inputManager.handleClick);

//   canvasManager.appendToDom();
//   canvasManager.draw();

//   draw();
// };
