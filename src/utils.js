export function gaussianRand() {
  return Math.abs(
    (Math.random() +
      Math.random() +
      Math.random() +
      Math.random() +
      Math.random() +
      Math.random() -
      3) /
      3,
  );
}

export function calcDimensionRatio() {
  const hRatio = 1080 / window.innerHeight;
  const wRatio = 1780 / window.innerWidth; // decreased due to parallax

  return Math.min(hRatio, wRatio);
}
