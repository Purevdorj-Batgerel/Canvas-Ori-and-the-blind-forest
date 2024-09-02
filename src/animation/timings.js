// https://easings.net/#easeInOutQuad
export function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
}

// https://easings.net/#easeOutQuad
export function easeOutQuad(x) {
  return 1 - (1 - x) * (1 - x);
}
