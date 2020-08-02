let analyser
let startTime

const crossFadeDuration = 1000

const bg = new Image()
const logo = new Image()
const pattern = new Image()
const clickIcon = new Image()
const audio = new Audio('./ori_main_theme.mp3')

logo.src = 'logo1.png'
bg.src = 'bg.jpg'
pattern.src = 'raster.png'
clickIcon.src = 'click.svg'

const fliesCount = window.innerHeight * window.innerWidth / 40000
const fireFlies = []

let mouseX = 0
let mouseY = 0

for (let i = 0; i < fliesCount; i++) {
  fireFlies.push({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: rnd2() * 100 + 6,
    angle: Math.random() * 360
  })
}

window.onload = () => {
  navigator.getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia

  const canvas = document.getElementById('canvas')
  const backgroundCanvas = document.createElement('canvas')
  const logoCanvas = document.createElement('canvas')
  const clickCanvas = document.createElement('canvas')
  const patternCanvas = document.createElement('canvas')
  const gradientCanvas = document.createElement('canvas')
  const textCanvas = document.createElement('canvas')

  const ctx = canvas.getContext('2d')

  let hRatio = bg.naturalHeight / window.innerHeight
  let wRatio = bg.naturalWidth / window.innerWidth
  let minRatio = Math.min(hRatio, wRatio)

  document.body.addEventListener('click', start)

  window.addEventListener('mousemove', function (evt) {
    mouseX = evt.x
    mouseY = evt.y
  })

  window.addEventListener('resize', function () {
    resizeAllCanvas()

    hRatio = bg.naturalHeight / window.innerHeight
    wRatio = bg.naturalWidth / window.innerWidth
    minRatio = Math.min(hRatio, wRatio)

    updateAll()
  })

  resizeAllCanvas()
  updateAll()

  function start () {
    startTime = performance.now()

    resizeAllCanvas()
    updateAll()
    audioInitializer()

    document.body.removeEventListener('click', start)
  }

  function audioInitializer () {
    const playPromise = audio.play()

    if (playPromise) {
      playPromise
        .then((_) => {
          const audioCtx = new (window.AudioContext ||
            window.webkitAudioContext)()
          analyser = audioCtx.createAnalyser()

          analyser.minDecibels = -110
          analyser.maxDecibels = -30
          analyser.smoothingTimeConstant = 0.88

          const source = audioCtx.createMediaElementSource(audio)
          source.connect(analyser)
          analyser.connect(audioCtx.destination)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }

  function resizeAllCanvas () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    backgroundCanvas.width = canvas.width
    backgroundCanvas.height = canvas.height

    logoCanvas.width = canvas.width
    logoCanvas.height = canvas.height

    clickCanvas.width = canvas.width
    clickCanvas.height = canvas.height

    patternCanvas.width = canvas.width
    patternCanvas.height = canvas.height

    gradientCanvas.width = canvas.width
    gradientCanvas.height = canvas.height

    textCanvas.width = canvas.width
    textCanvas.height = canvas.height
  }
  // #region Update
  function updateBackground () {
    if (bg.complete) {
      const finalWidth = bg.naturalWidth / minRatio
      const finalHeight = bg.naturalHeight / minRatio

      const wOffset = (window.innerWidth - finalWidth) / 2
      const hOffset = (window.innerHeight - finalHeight) / 2

      backgroundCanvas.getContext('2d').drawImage(bg, wOffset, hOffset, finalWidth, finalHeight)
    }
  }

  function updateLogo () {
    if (logo.complete) {
      const _minRatio = minRatio + 0.1

      const finalWidth = logo.naturalWidth / _minRatio
      const finalHeight = logo.naturalHeight / _minRatio

      const wOffset = (window.innerWidth - finalWidth) / 2
      const hOffset = -50 / _minRatio

      logoCanvas.getContext('2d').drawImage(logo, wOffset, hOffset, finalWidth, finalHeight)
    }
  }

  function updateClick () {
    if (clickIcon.complete) {
      const _minRatio = minRatio + 1

      const finalWidth = clickIcon.naturalWidth / _minRatio
      const finalHeight = clickIcon.naturalHeight / _minRatio

      const wOffset = (window.innerWidth - finalWidth) / 2 - 5
      const hOffset = window.innerHeight * 0.86

      clickCanvas.getContext('2d').drawImage(clickIcon, wOffset, hOffset, finalWidth, finalHeight)
    }
  }

  function updatePattern () {
    if (pattern.complete) {
      const _ctx = patternCanvas.getContext('2d')

      const ctxPattern = _ctx.createPattern(pattern, 'repeat')
      _ctx.fillStyle = ctxPattern
      _ctx.globalAlpha = 0.5
      _ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)
    }
  }

  function updateGradient () {
    const _ctx = gradientCanvas.getContext('2d')
    _ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
    const radius = Math.max(window.innerWidth, window.innerHeight) / 2
    const radGrad = ctx.createRadialGradient(
      radius,
      radius,
      0,
      radius,
      radius,
      radius * 1.4
    )

    radGrad.addColorStop(0, 'transparent')
    radGrad.addColorStop(0.7, 'transparent')
    radGrad.addColorStop(0.95, 'black')
    radGrad.addColorStop(1, 'black')

    _ctx.fillStyle = radGrad
    const hr = window.innerHeight / window.innerWidth
    const wr = window.innerWidth / window.innerHeight
    _ctx.setTransform(Math.min(1, wr), 0, 0, Math.min(1, hr), 0, 0)
    _ctx.fillRect(0, 0, radius * 2, radius * 2)
  }

  function updateText () {
    const _ctx = textCanvas.getContext('2d')
    const textWidth = window.innerWidth - 40
    let fontSize = Math.min(40, window.innerHeight / 20)
    let text = 'Main Theme - Definitive Edition'

    _ctx.font = `${fontSize}px Montserrat`
    _ctx.fillStyle = 'white'
    _ctx.textAlign = 'center'

    let lines = calcTextLines(_ctx, fontSize, text, textWidth)
    let cumulativeHeight = 0
    let lastHeight = 0
    lines.forEach((line) => {
      lastHeight = line.height
      _ctx.fillText(
        line.text.trim(),
        window.innerWidth / 2,
        window.innerHeight * 0.65 + cumulativeHeight + lastHeight
      )
    })

    cumulativeHeight += lastHeight + 8

    fontSize = Math.min(27, (window.innerHeight / 100) * 3)
    _ctx.font = `${fontSize}px Montserrat`
    text = 'Ori and the Blind Forest (Additional Soundtrack)'

    lines = calcTextLines(_ctx, fontSize, text, textWidth)
    lines.forEach((line) => {
      lastHeight = line.height
      _ctx.fillText(
        line.text,
        window.innerWidth / 2,
        window.innerHeight * 0.65 + cumulativeHeight + lastHeight
      )
    })

    cumulativeHeight += lastHeight + 8

    text = 'Gareth Coker'
    _ctx.font = `bold ${fontSize}px Montserrat`
    lines = calcTextLines(_ctx, fontSize, text, textWidth)
    lines.forEach((line) => {
      lastHeight = line.height
      _ctx.fillText(
        line.text,
        window.innerWidth / 2,
        window.innerHeight * 0.65 + cumulativeHeight + lastHeight
      )
    })
  }

  function updateAll () {
    updateBackground()
    updateLogo()
    updateClick()
    updatePattern()
    updateGradient()
    updateText()
  }
  // #endregion

  // #region Draw
  function draw (time) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    drawBackground()
    if (analyser) {
      visualizer()
    }
    drawLogo()
    drawClick(time)
    drawPattern()
    drawGradient()
    drawTexts(time)
    drawAnimation()

    window.requestAnimationFrame(draw)
  }

  function drawBackground () {
    ctx.drawImage(backgroundCanvas, 0, 0)
  }

  function visualizer () {
    if (window.innerWidth > 1599) {
      analyser.fftSize = 2048
    } else if (window.innerWidth < 600) {
      analyser.fftSize = 512
    } else {
      analyser.fftSize = 1024
    }

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    analyser.getByteFrequencyData(dataArray)
    const barWidth = window.innerWidth / bufferLength
    let barHeight
    let x = 0
    ctx.fillStyle = 'rgba(255, 255, 255,.5)'

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i]
      ctx.fillRect(x, window.innerHeight - barHeight, barWidth, barHeight)
      x += barWidth + 1
    }
  }

  function drawLogo () {
    ctx.drawImage(logoCanvas, 0, 0)
  }

  function drawClick (time) {
    let animationProgress, timeFraction
    if (startTime === undefined) {
      animationProgress = 1
    } else {
      timeFraction = (time - startTime) / crossFadeDuration
      if (timeFraction > 1) return
      animationProgress = 1 - timing(timeFraction)
    }

    ctx.globalAlpha = animationProgress
    ctx.drawImage(clickCanvas, 0, 0)
    ctx.globalAlpha = 1
  }

  function drawPattern () {
    ctx.drawImage(patternCanvas, 0, 0)
  }

  function drawGradient () {
    ctx.drawImage(gradientCanvas, 0, 0)
  }

  function drawTexts (time) {
    if (startTime === undefined) return
    let timeFraction = (time - startTime) / crossFadeDuration
    let animationProgress

    if (timeFraction < 0) {
      return
    } else if (timeFraction > 1) {
      timeFraction = 1
      animationProgress = 1
    } else {
      animationProgress = timing(timeFraction)
    }

    ctx.globalAlpha = 0.8 * animationProgress
    ctx.drawImage(textCanvas, 0, 0)
    ctx.globalAlpha = 1
  }

  function drawAnimation () {
    update()
    for (let i = 0; i < fliesCount; i++) {
      const f = fireFlies[i]
      const radGrad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r)

      const distance = Math.sqrt(
        (f.x - mouseX) * (f.x - mouseX) + (f.y - mouseY) * (f.y - mouseY)
      )

      if (distance > 100) {
        radGrad.addColorStop(0, 'rgba(255,255,164,.7)')
        radGrad.addColorStop(0.4, 'rgba(247,148,29,.3)')
        radGrad.addColorStop(1, 'rgba(255,218,164,0)')
      } else {
        radGrad.addColorStop(
          0,
          'rgba(255,255,164,' + (0.7 + (0.3 * (100 - distance)) / 100) + ')'
        )
        radGrad.addColorStop(
          0.4,
          'rgba(247,148,29,' + (0.3 + (0.4 * (100 - distance)) / 100) + ')'
        )
        radGrad.addColorStop(1, 'rgba(255,218,164,0)')
      }
      ctx.fillStyle = radGrad

      ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2)
    }
  }
  // #endregion

  window.requestAnimationFrame(draw)
}

function update () {
  for (let i = 0; i < fliesCount; i++) {
    const p = fireFlies[i]
    p.angle += 0.01
    p.y -= 0.02 * p.r
    const xChange = (Math.sin(p.angle) / 4) * (p.r / 20)
    p.x += xChange

    if (p.x > window.innerWidth + p.r * 2 || p.x < -p.r * 2 || p.y < -p.r * 2) {
      if (i % 3 > 0) {
        // 66.67% of the flakes
        fireFlies[i] = {
          x: Math.random() * window.innerWidth,
          y: window.innerHeight + p.r * 2,
          r: p.r,
          angle: p.angle
        }
      } else {
        if (xChange > 0) {
          // Enter from the left
          fireFlies[i] = {
            x: -p.r * 2 + 1,
            y: Math.random() * window.innerHeight,
            r: p.r,
            angle: p.angle
          }
        } else {
          // Enter from the right
          fireFlies[i] = {
            x: window.innerWidth + p.r * 2 - 1,
            y: Math.random() * window.innerHeight,
            r: p.r,
            angle: p.angle
          }
        }
      }
    }
  }
}

// #region Util
function calcTextLines (ctx, fontSize, text, maxWidth) {
  const lines = []
  const words = text.split(' ')
  let line = ''
  let lineTest = ''
  let height = 0
  const heightModifier = 1.4

  words.forEach((word) => {
    lineTest = line + word + ' '
    if (ctx.measureText(lineTest).width > maxWidth) {
      height = (lines.length + 1) * fontSize * heightModifier
      lines.push({ text: line, height })
      line = word + ' '
    } else {
      line = lineTest
    }
  })

  if (line.length > 0) {
    height = (lines.length + 1) * fontSize * heightModifier
    lines.push({ text: line.trim(), height })
  }

  return lines
}

function timing (timeFraction) {
  return timeFraction < 0.5
    ? 4 * timeFraction * timeFraction * timeFraction
    : 1 - Math.pow(-2 * timeFraction + 2, 3) / 2
}

function rnd2 () {
  return Math.abs(
    (Math.random() +
      Math.random() +
      Math.random() +
      Math.random() +
      Math.random() +
      Math.random() -
      3) /
      3
  )
}
// #endregion
