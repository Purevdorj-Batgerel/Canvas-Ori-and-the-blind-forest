/**
 * Resolves once every given image has either loaded or failed to load, so
 * callers never hang on a single broken asset.
 *
 * @param {HTMLImageElement[]} images
 * @returns {Promise<void>}
 */
export function waitForImages(images) {
  return Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        }),
    ),
  ).then(() => undefined);
}
