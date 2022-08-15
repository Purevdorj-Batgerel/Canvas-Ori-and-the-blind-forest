const FULLSCREEN_ICON_SIZE = 60;
const VOLUME_ICON_SIZE = 48;

import { setFadeStartTime } from "./globalValues";

export default class InputManager {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.tiltAngle = 0;
    this.mouseX = 0;
    this.mouseY = 0;

    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleDeviceOrientation = this.handleDeviceOrientation.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

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

  handleMouseMove(event) {
    this.mouseX = event.x;
    this.mouseY = event.y;

    const angle = (this.mouseX * 100) / window.innerWidth - 50;

    this.handleDeviceOrientation({ beta: angle, gamma: angle });
  }

  handleClick(event) {
    const { clientX, clientY } = event;

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
      this.audioManager.toggleMute();
      // drawUI();
    } else if (!this.audioManager.isSoundInitialized) {
      this.audioManager.playAudio();
      setFadeStartTime(performance.now());
    }
  }
}
