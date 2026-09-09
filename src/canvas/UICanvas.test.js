import test from "ava";
import { JSDOM } from "jsdom";

let UICanvas;
let calcFadeProgress;
let calcTextLines;
let setFadeStartTime;

test.before(async () => {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
  global.Audio = dom.window.Audio;
  global.Image = dom.window.Image;
  global.Path2D = class Path2D {
    constructor(path) {
      this.path = path;
    }
  };
  global.window.matchMedia = () => ({ matches: false });
  // UICanvas transitively imports the audioManager singleton from globalValues,
  // which constructs a real AudioContext at import time; jsdom doesn't implement
  // the Web Audio API, so it needs a minimal stub before that import happens.
  global.window.AudioContext = class {
    createAnalyser() {
      return {};
    }
    async resume() {}
  };

  ({
    default: UICanvas,
    calcFadeProgress,
    calcTextLines,
  } = await import("./UICanvas.js"));
  ({ setFadeStartTime } = await import("../globalValues.js"));
});

test.beforeEach(() => {
  setFadeStartTime(0);
});

function createFakeCtx() {
  const noop = () => {};
  return {
    save: noop,
    restore: noop,
    clearRect: noop,
    fillRect: noop,
    fill: noop,
    drawImage: noop,
    fillText: noop,
    scale: noop,
    translate: noop,
    setTransform: noop,
    createRadialGradient: () => ({ addColorStop: noop }),
    createPattern: () => "pattern",
    measureText: (text) => ({ width: text.length * 10 }),
    fillStyle: null,
    globalAlpha: 1,
    font: "",
    textAlign: "",
  };
}

test.serial("calcFadeProgress is 0 before the fade has started", (t) => {
  t.is(calcFadeProgress(undefined, 0, 1000), 0);
  t.is(calcFadeProgress(1500, 0, 1000), 0);
});

test.serial("calcFadeProgress eases between 0 and 1 while fading", (t) => {
  const progress = calcFadeProgress(1500, 1000, 1000);
  t.true(progress > 0 && progress < 1);
});

test.serial(
  "calcFadeProgress clamps to 1 once the fade duration has elapsed",
  (t) => {
    t.is(calcFadeProgress(3000, 1000, 1000), 1);
  },
);

test.serial("calcTextLines keeps short text on a single line", (t) => {
  const ctx = { measureText: (text) => ({ width: text.length }) };

  const lines = calcTextLines(ctx, 10, "hi", 100);

  t.is(lines.length, 1);
  t.is(lines[0].text.trim(), "hi");
});

test.serial(
  "calcTextLines wraps text across multiple lines once it exceeds maxWidth",
  (t) => {
    const ctx = { measureText: (text) => ({ width: text.length }) };

    const lines = calcTextLines(ctx, 10, "aaa bbb ccc", 5);

    t.is(lines.length, 3);
    t.deepEqual(
      lines.map((line) => line.text.trim()),
      ["aaa", "bbb", "ccc"],
    );
  },
);

test.serial("a freshly constructed canvas needs its first draw", (t) => {
  const uiCanvas = new UICanvas();

  t.true(uiCanvas.shouldRedraw());
});

test.serial(
  "shouldRedraw is false once drawn, with no fade running and nothing marked dirty",
  (t) => {
    const uiCanvas = new UICanvas();
    uiCanvas.ctx = createFakeCtx();

    uiCanvas.draw();

    t.false(uiCanvas.shouldRedraw(100));
  },
);

test.serial(
  "shouldRedraw stays true every frame while the fade is in progress",
  (t) => {
    const uiCanvas = new UICanvas();
    uiCanvas.ctx = createFakeCtx();
    setFadeStartTime(1000);

    uiCanvas.draw(1000);

    t.true(uiCanvas.shouldRedraw(1500));
  },
);

test.serial(
  "shouldRedraw is false again once the fade completes, stopping the redraw-forever bug",
  (t) => {
    const uiCanvas = new UICanvas();
    uiCanvas.ctx = createFakeCtx();
    setFadeStartTime(1000);

    uiCanvas.draw(3000); // fade duration is 1000ms, so this frame already completes it

    t.false(uiCanvas.shouldRedraw(3100));
  },
);

test.serial(
  "markDirty forces one more redraw even after a fade has settled",
  (t) => {
    const uiCanvas = new UICanvas();
    uiCanvas.ctx = createFakeCtx();
    setFadeStartTime(1000);
    uiCanvas.draw(3000);

    uiCanvas.markDirty();

    t.true(uiCanvas.shouldRedraw(3100));
  },
);

test.serial("draw is a no-op when nothing needs to be redrawn", (t) => {
  const uiCanvas = new UICanvas();
  uiCanvas.ctx = createFakeCtx();
  uiCanvas.draw();

  let clearCalls = 0;
  uiCanvas.ctx.clearRect = () => {
    clearCalls += 1;
  };

  uiCanvas.draw(100);

  t.is(clearCalls, 0);
});
