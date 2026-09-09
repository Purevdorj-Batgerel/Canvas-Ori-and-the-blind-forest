const FULLSCREEN_ICON_SIZE = 60;
const VOLUME_ICON_SIZE = 48;

import { audioManager } from "./audioManagerInstance.js";
import { setFadeStartTime } from "./fadeState.js";

/**
 * Checks whether the current platform requires an explicit, user-gesture-triggered
 * permission request before `deviceorientation` events will fire (iOS 13+ Safari).
 *
 * @returns {boolean} True if `requestDeviceOrientationPermission` must be called first.
 */
export function isDeviceOrientationPermissionRequired() {
  return (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  );
}

/**
 * Requests permission to receive `deviceorientation` events. Must be called
 * from within a user gesture handler (e.g. a click) on platforms that require it.
 * Resolves to true immediately on platforms that don't require this step.
 *
 * @returns {Promise<boolean>} Whether permission was granted.
 */
export async function requestDeviceOrientationPermission() {
  if (!isDeviceOrientationPermissionRequired()) {
    return true;
  }

  const permission = await DeviceOrientationEvent.requestPermission();
  return permission === "granted";
}

/**
 * Manages user input.
 * @class
 */
export default class InputManager {
  constructor() {
    this.tiltAngle = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  /**
   * Toggles the browser fullscreen state.
   */
  toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.body.requestFullscreen();
    }
  }

  /**
   * Handles device orientation events (e.g., accelerometer) and updates the tilt angle.
   *
   * @param {DeviceOrientationEvent} event - The device orientation event object.
   */
  handleDeviceOrientation(event) {
    let { beta, gamma } = event;

    if (gamma > 45) {
      gamma = 45;
    } else if (gamma < -45) {
      gamma = -45;
    }

    if (beta > 45) {
      beta = 45;
    } else if (beta < -45) {
      beta = -45;
    }

    if (window.innerHeight > window.innerWidth) {
      this.tiltAngle = gamma;
    } else {
      this.tiltAngle = beta;
    }
  }

  /**
   * Handles mouse movement events and updates the mouse position and translate to tilt angle.
   *
   * @param {MouseEvent} event - The mouse move event object.
   */
  handleMouseMove(event) {
    this.mouseX = event.x;
    this.mouseY = event.y;

    const angle = (this.mouseX * 100) / window.innerWidth - 50;

    this.handleDeviceOrientation({ beta: angle, gamma: angle });
  }

  /**
   * Handles click events and performs actions based on the click location.
   *
   * @param {MouseEvent} event - The click event object.
   */
  handleClick(event) {
    const { clientX, clientY } = event;

    // TODO: improve handle logic
    if (
      window.innerWidth - FULLSCREEN_ICON_SIZE - 16 < clientX &&
      clientX < window.innerWidth - 16 &&
      clientY > 16 &&
      clientY < 16 + FULLSCREEN_ICON_SIZE
    ) {
      this.toggleFullscreen();
    } else if (
      16 < clientX &&
      clientX < 16 + VOLUME_ICON_SIZE &&
      16 < clientY &&
      clientY < 16 + VOLUME_ICON_SIZE
    ) {
      audioManager.toggleMute();
    } else if (!audioManager.isSoundInitialized) {
      audioManager.playAudio();
      setFadeStartTime(performance.now());
    }
  }

  /**
   * Handles keyboard shortcuts: Space toggles mute, F toggles fullscreen.
   *
   * @param {KeyboardEvent} event - The keydown event object.
   */
  handleKeyDown(event) {
    if (event.code === "Space") {
      event.preventDefault();
      audioManager.toggleMute();
    } else if (event.key.toLowerCase() === "f") {
      this.toggleFullscreen();
    }
  }
}
