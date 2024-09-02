/**
 * Generates a random number from a Gaussian distribution with a mean of 0 and a standard deviation of 1.
 *
 * @returns {number} A random number between 0 and 1.
 */
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

/**
 * Calculates the aspect ratio of the screen relative to a specific reference resolution.
 *
 * @returns {number} The calculated aspect ratio.
 */
export function calcDimensionRatio() {
  const hRatio = 1080 / window.innerHeight;
  const wRatio = 1780 / window.innerWidth; // decreased due to parallax

  return Math.min(hRatio, wRatio);
}
