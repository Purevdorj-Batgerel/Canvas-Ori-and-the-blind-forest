import Canvas from "./Canvas";

export default class VisualizerCanvas extends Canvas {
  constructor(analyser) {
    super();
    this.analyser = analyser;
  }

  draw() {
    this.clear();
    if (window.innerWidth > 1599) {
      this.analyser.fftSize = 2048;
    } else if (window.innerWidth < 600) {
      this.analyser.fftSize = 512;
    } else {
      this.analyser.fftSize = 1024;
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    const barWidth = window.innerWidth / bufferLength;
    let barHeight;
    let x = 0;
    this.ctx.fillStyle = "rgba(255, 255, 255,.5)";

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i];

      this.ctx.fillRect(x, window.innerHeight - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }
}
