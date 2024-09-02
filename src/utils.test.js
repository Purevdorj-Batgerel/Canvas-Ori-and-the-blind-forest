import test from "ava";
import { JSDOM } from "jsdom";

import { calcDimensionRatio, gaussianRand } from "./utils.js";

test.before(() => {
  const dom = new JSDOM('<div id="my-element-id" />'); // insert any html needed for the unit test suite here
  global.window = dom.window;
});

test("gaussianRand returns a number", (t) => {
  const rand = gaussianRand();
  t.is(typeof rand, "number");
});

test("gaussianRand returns a number between 0 and 1", (t) => {
  const rand = gaussianRand();
  t.true(rand >= 0 && rand <= 1);
});

test("calcDimensionRatio returns a number", (t) => {
  const ratio = calcDimensionRatio();
  t.is(typeof ratio, "number");
});

test("calcDimensionRatio returns the correct aspect ratio", (t) => {
  // Mock window dimensions
  window.innerWidth = 1920;
  window.innerHeight = 1080;
  t.is(calcDimensionRatio(), 1780 / 1920);

  window.innerWidth = 1000;
  window.innerHeight = 900;
  t.is(calcDimensionRatio(), 1080 / 900);
});
