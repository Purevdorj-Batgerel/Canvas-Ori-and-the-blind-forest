import test from "ava";
import { JSDOM } from "jsdom";
import CanvasManager from "./CanvasManager.js";
import Canvas from "./canvas/Canvas.js";

test.before(() => {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
});

function createStubCanvas() {
  const canvas = new Canvas();
  canvas.ctx = { setTransform() {}, clearRect() {} };
  canvas.resizeCalls = 0;
  canvas.drawCalls = 0;
  canvas.resize = function resize() {
    this.resizeCalls += 1;
  };
  canvas.draw = function draw() {
    this.drawCalls += 1;
  };
  return canvas;
}

test("constructor rejects arguments that are not Canvas instances", (t) => {
  t.throws(() => new CanvasManager(createStubCanvas(), {}));
});

test("constructor stacks canvases absolutely with an incrementing z-index", (t) => {
  const a = createStubCanvas();
  const b = createStubCanvas();

  new CanvasManager(a, b);

  t.is(a.canvas.style.position, "absolute");
  t.is(a.canvas.style.zIndex, "0");
  t.is(b.canvas.style.zIndex, "1");
});

test("constructor resizes every canvas once up front", (t) => {
  const a = createStubCanvas();
  const b = createStubCanvas();

  new CanvasManager(a, b);

  t.is(a.resizeCalls, 1);
  t.is(b.resizeCalls, 1);
});

test("getCanvasElements returns the raw canvas elements in construction order", (t) => {
  const a = createStubCanvas();
  const b = createStubCanvas();
  const manager = new CanvasManager(a, b);

  t.deepEqual(manager.getCanvasElements(), [a.canvas, b.canvas]);
});

test("appendToDom appends every managed canvas element to the document body", (t) => {
  const a = createStubCanvas();
  const manager = new CanvasManager(a);

  manager.appendToDom();

  t.true(document.body.contains(a.canvas));
});

test("resizeCanvases resizes every managed canvas again", (t) => {
  const a = createStubCanvas();
  const b = createStubCanvas();
  const manager = new CanvasManager(a, b);

  manager.resizeCanvases();

  t.is(a.resizeCalls, 2);
  t.is(b.resizeCalls, 2);
});

test("draw calls draw on every managed canvas", (t) => {
  const a = createStubCanvas();
  const b = createStubCanvas();
  const manager = new CanvasManager(a, b);

  manager.draw();

  t.is(a.drawCalls, 1);
  t.is(b.drawCalls, 1);
});
