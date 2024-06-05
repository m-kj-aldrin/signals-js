import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.js"),
      name: "signals",
      fileName: () => "index.js", // Ensures the output file is always named index.js
      formats: ["es"], // Output only the ES module format
    },
    rollupOptions: {
      // Externalize dependencies that shouldn't be bundled
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
