import CanvasManager from "./src/CanvasManager";
import { ParallaxCanvas, UICanvas, WispCanvas, VisualizerCanvas } from "./src/canvas"
import { fadeStartTime, setDimensionRatio, audioManager, inputManager } from "./src/globalValues";

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
