const FULLSCREEN_ICON_SIZE = 60;
const VOLUME_ICON_SIZE = 48;

import { audioManager, setFadeStartTime } from "./globalValues";

/**
 * Manages user input.
 *
 */
export default class InputManager {
  /**
   * @constructor
   */
  constructor() {
    this.tiltAngle = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.handleClick = this.handleClick.bind(this);
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
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.body.requestFullscreen();
      }
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
}
