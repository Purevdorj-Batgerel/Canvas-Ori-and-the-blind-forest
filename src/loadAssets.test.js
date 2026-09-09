import test from "ava";

import { waitForImages } from "./loadAssets.js";

function createFakeImage({ complete = false } = {}) {
  const listeners = {};
  return {
    complete,
    addEventListener(event, handler) {
      listeners[event] = handler;
    },
    fire(event) {
      listeners[event]?.();
    },
  };
}

test("resolves immediately for images that are already complete", async (t) => {
  const image = createFakeImage({ complete: true });

  await t.notThrowsAsync(waitForImages([image]));
});

test("resolves once every image has fired load or error", async (t) => {
  const loaded = createFakeImage();
  const failed = createFakeImage();

  const promise = waitForImages([loaded, failed]);
  loaded.fire("load");
  failed.fire("error");

  await t.notThrowsAsync(promise);
});
