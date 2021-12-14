// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  mode: "production",
  mount: {},
  plugins: [
    /* ... */
  ],
  exclude: [
    "**/node_modules/**/*",
    "**/*.json",
    "**/*.config.js",
    "**/snowpack.*",
    "**/README.md",
  ],
  packageOptions: {},
  devOptions: {
    /* ... */
  },
  buildOptions: {
    out: "public",
  },
  optimize: {
    bundle: true,
    minify: true,
    treeshake: true,
    sourcemap: false,
    target: "es2020",
    entrypoints: ["./index.html"],
  },
};
