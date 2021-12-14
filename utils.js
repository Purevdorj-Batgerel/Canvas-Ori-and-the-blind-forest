export function rnd2() {
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

export function timing(timeFraction) {
  return timeFraction < 0.5
    ? 4 * timeFraction * timeFraction * timeFraction
    : 1 - Math.pow(-2 * timeFraction + 2, 3) / 2;
}

export function calcTextLines(ctx, fontSize, text, maxWidth) {
  const lines = [];
  const words = text.split(" ");
  let line = "";
  let lineTest = "";
  let height = 0;
  const heightModifier = 1.4;

  words.forEach((word) => {
    lineTest = line + word + " ";
    if (ctx.measureText(lineTest).width > maxWidth) {
      height = (lines.length + 1) * fontSize * heightModifier;
      lines.push({ text: line, height });
      line = word + " ";
    } else {
      line = lineTest;
    }
  });

  if (line.length > 0) {
    height = (lines.length + 1) * fontSize * heightModifier;
    lines.push({ text: line.trim(), height });
  }

  return lines;
}

export function calcDimensionRatio() {
  const hRatio = 1080 / window.innerHeight;
  const wRatio = 1780 / window.innerWidth;
  return Math.min(hRatio, wRatio);
}
