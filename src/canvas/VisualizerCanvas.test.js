import test from "ava";
import { JSDOM } from "jsdom";

import VisualizerCanvas, { calcFftSize } from "./VisualizerCanvas.js";

test.before(() => {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
});

test("calcFftSize uses a larger fft for wide screens", (t) => {
  t.is(calcFftSize(1920), 2048);
});

test("calcFftSize uses a smaller fft for narrow screens", (t) => {
  t.is(calcFftSize(320), 512);
});

test("calcFftSize uses the medium fft for everything in between", (t) => {
  t.is(calcFftSize(1024), 1024);
});

function createFakeAnalyser(bufferLength) {
  return {
    fftSize: 0,
    frequencyBinCount: bufferLength,
    getByteFrequencyData(array) {
      array.fill(10);
    },
  };
}

function createFakeCtx() {
  return { fillRect() {}, clearRect() {}, fillStyle: null };
}

test("draw reuses the same buffer across frames when its size does not change", (t) => {
  window.innerWidth = 1920;
  window.innerHeight = 1080;
  const analyser = createFakeAnalyser(4);
  const visualizer = new VisualizerCanvas(analyser);
  visualizer.ctx = createFakeCtx();

  visualizer.draw();
  const firstBuffer = visualizer.dataArray;
  visualizer.draw();

  t.is(visualizer.dataArray, firstBuffer);
});

test("draw allocates a new buffer only when the analyser's buffer length changes", (t) => {
  window.innerWidth = 1920;
  window.innerHeight = 1080;
  const analyser = createFakeAnalyser(4);
  const visualizer = new VisualizerCanvas(analyser);
  visualizer.ctx = createFakeCtx();

  visualizer.draw();
  const firstBuffer = visualizer.dataArray;
  analyser.frequencyBinCount = 8;
  visualizer.draw();

  t.not(visualizer.dataArray, firstBuffer);
  t.is(visualizer.dataArray.length, 8);
});
