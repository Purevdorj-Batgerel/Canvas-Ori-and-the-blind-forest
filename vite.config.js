import basicSsl from "@vitejs/plugin-basic-ssl";
import { defineConfig } from "vite";

export default defineConfig({
  base: "",
  server: {
    https: true,
  },
  plugins: [basicSsl()],
  build: {
    assetsDir: "./",
  },
});
