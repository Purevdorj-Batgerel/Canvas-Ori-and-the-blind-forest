window.onload = () => {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  let analyser;

  let canvas = document.getElementById('canvas');
  let ctx = canvas.getContext('2d');

  let mouseX = 0,
    mouseY = 0;

  let fireFlies = [];
  let fliesCount = 50;

  document.body.addEventListener('click', audioInitializer);

  window.addEventListener('mousemove', function(evt) {
    mouseX = evt.x;
    mouseY = evt.y;
  });

  for (let i = 0; i < fliesCount; i++) {
    fireFlies.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: rnd2() * 100 + 6,
      angle: Math.random() * 360
    });
  }

  const bg = new Image();
  const logo = new Image();
  logo.src = 'logo2.png';
  bg.src = 'bg.jpg';

  function audioInitializer() {
    const audioElement = document.getElementById('audio');

    const playPromise = audioElement.play();

    if (playPromise) {
      playPromise
        .then(_ => {
          const audioCtx = new (window.AudioContext ||
            window.webkitAudioContext)();
          analyser = audioCtx.createAnalyser();

          analyser.minDecibels = -110;
          analyser.maxDecibels = -30;
          analyser.smoothingTimeConstant = 0.88;

          const source = audioCtx.createMediaElementSource(audioElement);
          source.connect(analyser);
          analyser.connect(audioCtx.destination);
        })
        .catch(error => {
          console.log(error);
        })
        .finally(_ => {
          document.body.removeEventListener('click', audioInitializer);
        });
    }
  }

  function draw() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    drawBackground();
    if (analyser) {
      visualizer();
    }
    drawLogo();
    drawAnimation();

    window.requestAnimationFrame(draw);
  }

  function drawBackground() {
    let minRatio = 1;
    let finalWidth, finalHeight;
    let wOffset, hOffset;

    if (bg) {
      let hRatio = bg.naturalHeight / window.innerHeight;
      let wRatio = bg.naturalWidth / window.innerWidth;

      minRatio = hRatio > wRatio ? wRatio : hRatio;
      finalWidth = bg.naturalWidth / minRatio;
      finalHeight = bg.naturalHeight / minRatio;

      wOffset = (window.innerWidth - finalWidth) / 2;
      hOffset = (window.innerHeight - finalHeight) / 2;

      ctx.drawImage(bg, wOffset, hOffset, finalWidth, finalHeight);
    }
  }

  function drawLogo() {
    let minRatio = 1;
    let finalWidth, finalHeight;
    let wOffset, hOffset;

    if (logo) {
      let hRatio = bg.naturalHeight / window.innerHeight;
      let wRatio = bg.naturalWidth / window.innerWidth;

      minRatio = hRatio > wRatio ? wRatio : hRatio;

      finalWidth = logo.naturalWidth / minRatio;
      finalHeight = logo.naturalHeight / minRatio;

      wOffset = (window.innerWidth - finalWidth) / 2;
      hOffset = -50 / minRatio;
      // (window.innerHeight - finalHeight)
      ctx.drawImage(logo, wOffset, hOffset, finalWidth, finalHeight);
    }
  }

  function drawAnimation() {
    for (let i = 0; i < fliesCount; i++) {
      ctx.save();

      let f = fireFlies[i];
      let radGrad = ctx.createRadialGradient(f.r, f.r, 0, f.r, f.r, f.r);

      let distance = Math.sqrt(
        (f.x - mouseX) * (f.x - mouseX) + (f.y - mouseY) * (f.y - mouseY)
      );

      if (distance > 100) {
        radGrad.addColorStop(0, 'rgba(255,255,164,.7)');
        radGrad.addColorStop(0.4, 'rgba(247,148,29,.3)');
        radGrad.addColorStop(1, 'rgba(255,218,164,0)');
      } else {
        console;
        radGrad.addColorStop(
          0,
          'rgba(255,255,164,' + (0.7 + (0.3 * (100 - distance)) / 100) + ')'
        );
        radGrad.addColorStop(
          0.4,
          'rgba(247,148,29,' + (0.3 + (0.4 * (100 - distance)) / 100) + ')'
        );
        radGrad.addColorStop(1, 'rgba(255,218,164,0)');
      }
      ctx.fillStyle = radGrad;

      ctx.translate(f.x, f.y);
      ctx.fillRect(0, 0, f.r * 2, f.r * 2);

      ctx.restore();
    }
    update();
  }

  function update() {
    for (let i = 0; i < fliesCount; i++) {
      let p = fireFlies[i];
      p.angle += 0.01;
      p.y -= 0.02 * p.r;
      let xChange = (Math.sin(p.angle) / 4) * (p.r / 20);
      p.x += xChange;

      if (
        p.x > window.innerWidth + p.r * 2 ||
        p.x < -p.r * 2 ||
        p.y < -p.r * 2
      ) {
        if (i % 3 > 0) {
          //66.67% of the flakes
          fireFlies[i] = {
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + p.r * 2,
            r: p.r,
            angle: p.angle
          };
        } else {
          if (xChange > 0) {
            //Enter from the left
            fireFlies[i] = {
              x: -p.r * 2 + 1,
              y: Math.random() * window.innerHeight,
              r: p.r,
              angle: p.angle
            };
          } else {
            //Enter from the right
            fireFlies[i] = {
              x: window.innerWidth + p.r * 2 - 1,
              y: Math.random() * window.innerHeight,
              r: p.r,
              angle: p.angle
            };
          }
        }
      }
    }
  }

  function visualizer() {
    if (window.innerWidth > 1599) {
      analyser.fftSize = 2048;
    } else if (window.innerWidth < 600) {
      analyser.fftSize = 512;
    } else {
      analyser.fftSize = 1024;
    }

    let bufferLength = analyser.frequencyBinCount;
    let dataArray = new Uint8Array(bufferLength);

    analyser.getByteFrequencyData(dataArray);
    let barWidth = window.innerWidth / bufferLength;
    let barHeight;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      ctx.save();
      barHeight = dataArray[i];
      ctx.fillStyle = 'rgba(255, 255, 255,.5)';
      ctx.fillRect(x, window.innerHeight - barHeight, barWidth, barHeight);
      x += barWidth + 1;
      ctx.restore();
    }
  }

  window.requestAnimationFrame(draw);

  function rnd2() {
    return Math.abs(
      (Math.random() +
        Math.random() +
        Math.random() +
        Math.random() +
        Math.random() +
        Math.random() -
        3) /
        3
    );
  }
};
