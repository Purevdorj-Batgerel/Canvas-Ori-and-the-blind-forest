import test from "ava";
import { JSDOM } from "jsdom";

let AudioManager;

test.before(async () => {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
  global.Audio = dom.window.Audio;
  global.window.AudioContext = class {
    createAnalyser() {
      return {};
    }
    async resume() {}
  };

  ({ default: AudioManager } = await import("./AudioManager.js"));
});

test("setVolume/getVolume round-trip the playback volume", (t) => {
  const audioManager = new AudioManager();

  audioManager.setVolume(0.4);

  t.is(audioManager.getVolume(), 0.4);
});

test("toggleMute flips the muted state", (t) => {
  const audioManager = new AudioManager();
  const before = audioManager.isMuted();

  audioManager.toggleMute();

  t.is(audioManager.isMuted(), !before);
});
