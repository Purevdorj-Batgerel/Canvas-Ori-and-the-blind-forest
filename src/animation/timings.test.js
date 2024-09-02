import test from "ava";
import { easeInOutQuad, easeOutQuad } from "./timings.js";

test("easeInOutQuad should return 0 for x = 0", (t) => {
  t.is(easeInOutQuad(0), 0);
});

test("easeInOutQuad should return 1 for x = 1", (t) => {
  t.is(easeInOutQuad(1), 1);
});

test("easeInOutQuad should return 0.5 for x = 0.5", (t) => {
  t.is(easeInOutQuad(0.5), 0.5);
});

test("easeInOutQuad should return the correct value for x = 0.25", (t) => {
  t.is(easeInOutQuad(0.25), 0.125);
});

test("easeInOutQuad should return the correct value for x = 0.75", (t) => {
  t.is(easeInOutQuad(0.75), 0.875);
});

test("easeInOutQuad should throw an error for x < 0", (t) => {
  t.throws(() => easeInOutQuad(-0.5));
});

test("easeInOutQuad should throw an error for x > 1", (t) => {
  t.throws(() => easeInOutQuad(1.5));
});

test("easeOutQuad should return 0 for x = 0", (t) => {
  t.is(easeOutQuad(0), 0);
});

test("easeOutQuad should return 1 for x = 1", (t) => {
  t.is(easeOutQuad(1), 1);
});

test("easeOutQuad should return the correct value for x = 0.5", (t) => {
  t.is(easeOutQuad(0.5), 0.75);
});

test("easeOutQuad should return the correct value for x = 0.25", (t) => {
  t.is(easeOutQuad(0.25), 0.4375);
});

test("easeOutQuad should return the correct value for x = 0.75", (t) => {
  t.is(easeOutQuad(0.75), 0.9375);
});

test("easeOutQuad should throw an error for x < 0", (t) => {
  t.throws(() => easeOutQuad(-0.5));
});

test("easeOutQuad should throw an error for x > 1", (t) => {
  t.throws(() => easeOutQuad(1.5));
});
