import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

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
