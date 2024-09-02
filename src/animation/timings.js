/**
 * A function to calculate the easeInOutQuad easing value.
 * This function represents a quadratic easing in and out.
 *
 * @param {number} x - The input value to ease. It should be between 0 and 1.
 * @returns {number} - The eased value. It will be between 0 and 1.
 * @throws {Error} - If the input value 'x' is not a number or is outside the range [0, 1].
 *
 * @see {@link https://easings.net/#easeInOutQuad|Easing.net - easeInOutQuad}
 */
export function easeInOutQuad(x) {
  if (typeof x !== "number" || x < 0 || x > 1) {
    throw new Error("Invalid input: input must be a number between 0 and 1.");
  }

  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

/**
 * A function to calculate the easeOutQuad easing value.
 * This function represents a quadratic easing in and out.
 *
 * @param {number} x - The input value to ease. It should be between 0 and 1.
 * @returns {number} - The eased value. It will be between 0 and 1.
 * @throws {Error} - If the input value 'x' is not a number or is outside the range [0, 1].
 *
 * @see {@link https://easings.net/#easeOutQuad|Easing.net - easeOutQuad}
 */
export function easeOutQuad(x) {
  if (typeof x !== "number" || x < 0 || x > 1) {
    throw new Error("Invalid input: 'x' must be a number between 0 and 1.");
  }

  return 1 - (1 - x) * (1 - x);
}
