import test from "ava";
import { JSDOM } from "jsdom";

let InputManager;
let isDeviceOrientationPermissionRequired;
let requestDeviceOrientationPermission;
let audioManager;

test.before(async () => {
  const dom = new JSDOM();
  global.window = dom.window;
  global.document = dom.window.document;
  global.Audio = dom.window.Audio;
  // Inputs.js transitively imports the audioManager singleton from globalValues,
  // which constructs a real AudioContext at import time; jsdom doesn't implement
  // the Web Audio API, so it needs a minimal stub before that import happens.
  global.window.AudioContext = class {
    createAnalyser() {
      return {};
    }
    async resume() {}
  };

  ({
    default: InputManager,
    isDeviceOrientationPermissionRequired,
    requestDeviceOrientationPermission,
  } = await import("./Inputs.js"));
  ({ audioManager } = await import("./globalValues.js"));
});

test.serial(
  "handleDeviceOrientation clamps beta above 45 degrees in landscape orientation",
  (t) => {
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    const inputManager = new InputManager();

    inputManager.handleDeviceOrientation({ beta: 90, gamma: 0 });

    t.is(inputManager.tiltAngle, 45);
  },
);

test.serial(
  "handleDeviceOrientation clamps beta below -45 degrees in landscape orientation",
  (t) => {
    window.innerWidth = 1920;
    window.innerHeight = 1080;
    const inputManager = new InputManager();

    inputManager.handleDeviceOrientation({ beta: -90, gamma: 0 });

    t.is(inputManager.tiltAngle, -45);
  },
);

test.serial(
  "handleDeviceOrientation uses gamma instead of beta in portrait orientation",
  (t) => {
    window.innerWidth = 800;
    window.innerHeight = 1200;
    const inputManager = new InputManager();

    inputManager.handleDeviceOrientation({ beta: 10, gamma: 20 });

    t.is(inputManager.tiltAngle, 20);
  },
);

test.serial(
  "handleMouseMove derives a clamped tilt angle from the horizontal cursor position",
  (t) => {
    window.innerWidth = 1000;
    window.innerHeight = 500;
    const inputManager = new InputManager();

    inputManager.handleMouseMove({ x: 1000, y: 0 });

    t.is(inputManager.mouseX, 1000);
    t.is(inputManager.tiltAngle, 45);
  },
);

test.serial(
  "handleClick toggles fullscreen when the fullscreen icon region is clicked",
  (t) => {
    window.innerWidth = 1000;
    window.innerHeight = 800;
    let requestFullscreenCalled = false;
    document.body.requestFullscreen = () => {
      requestFullscreenCalled = true;
    };
    const inputManager = new InputManager();

    inputManager.handleClick({ clientX: 950, clientY: 30 });

    t.true(requestFullscreenCalled);
  },
);

test.serial(
  "handleClick toggles mute when the volume icon region is clicked",
  (t) => {
    window.innerWidth = 1000;
    window.innerHeight = 800;
    const inputManager = new InputManager();
    const before = audioManager.isMuted();

    inputManager.handleClick({ clientX: 30, clientY: 30 });

    t.is(audioManager.isMuted(), !before);
  },
);

test.serial(
  "handleKeyDown toggles mute on Space and prevents the default scroll",
  (t) => {
    const inputManager = new InputManager();
    const before = audioManager.isMuted();
    let defaultPrevented = false;

    inputManager.handleKeyDown({
      code: "Space",
      key: " ",
      preventDefault: () => {
        defaultPrevented = true;
      },
    });

    t.is(audioManager.isMuted(), !before);
    t.true(defaultPrevented);
  },
);

test.serial("handleKeyDown toggles fullscreen on F", (t) => {
  let requestFullscreenCalled = false;
  document.body.requestFullscreen = () => {
    requestFullscreenCalled = true;
  };
  const inputManager = new InputManager();

  inputManager.handleKeyDown({ code: "KeyF", key: "f" });

  t.true(requestFullscreenCalled);
});

test.serial("handleKeyDown ignores unrelated keys", (t) => {
  const inputManager = new InputManager();
  const before = audioManager.isMuted();

  inputManager.handleKeyDown({ code: "KeyA", key: "a" });

  t.is(audioManager.isMuted(), before);
});

test.serial(
  "isDeviceOrientationPermissionRequired is false on platforms without the permission API",
  (t) => {
    t.false(isDeviceOrientationPermissionRequired());
  },
);

test.serial(
  "requestDeviceOrientationPermission resolves true immediately when no permission is required",
  async (t) => {
    t.true(await requestDeviceOrientationPermission());
  },
);

test.serial(
  "requestDeviceOrientationPermission reflects the platform's permission decision",
  async (t) => {
    global.DeviceOrientationEvent = {
      async requestPermission() {
        return "denied";
      },
    };

    t.false(await requestDeviceOrientationPermission());

    delete global.DeviceOrientationEvent;
  },
);
