import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  base: "./",
  plugins: [preact()],
  build: {
    outDir: "../../docs/review",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/review.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
