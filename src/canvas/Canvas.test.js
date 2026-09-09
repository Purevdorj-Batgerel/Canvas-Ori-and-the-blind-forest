import test from "ava";
import { JSDOM } from "jsdom";

import Canvas from "./Canvas.js";

test.before(() => {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
});

function createTestCanvas() {
  const canvas = new Canvas();
  const calls = { setTransform: [], clearRect: [] };
  canvas.ctx = {
    setTransform: (...args) => calls.setTransform.push(args),
    clearRect: (...args) => calls.clearRect.push(args),
  };
  return { canvas, calls };
}

test("resize scales the backing store by the device pixel ratio", (t) => {
  window.innerWidth = 800;
  window.innerHeight = 600;
  const { canvas, calls } = createTestCanvas();

  canvas.resize(2);

  t.is(canvas.canvas.width, 1600);
  t.is(canvas.canvas.height, 1200);
  t.deepEqual(calls.setTransform, [[2, 0, 0, 2, 0, 0]]);
  t.is(canvas.dpr, 2);
});

test("resize keeps the CSS size at the window's logical size", (t) => {
  window.innerWidth = 800;
  window.innerHeight = 600;
  const { canvas } = createTestCanvas();

  canvas.resize(2);

  t.is(canvas.canvas.style.width, "800px");
  t.is(canvas.canvas.style.height, "600px");
});

test("resize defaults to window.devicePixelRatio when not given an explicit ratio", (t) => {
  window.innerWidth = 400;
  window.innerHeight = 300;
  window.devicePixelRatio = 3;
  const { canvas, calls } = createTestCanvas();

  canvas.resize();

  t.deepEqual(calls.setTransform, [[3, 0, 0, 3, 0, 0]]);
});

test("clear clears the full logical-pixel area regardless of the device pixel ratio", (t) => {
  window.innerWidth = 500;
  window.innerHeight = 400;
  const { canvas, calls } = createTestCanvas();

  canvas.clear();

  t.deepEqual(calls.clearRect, [[0, 0, 500, 400]]);
});

test("draw throws by default, forcing subclasses to implement it", (t) => {
  const { canvas } = createTestCanvas();

  t.throws(() => canvas.draw());
});
