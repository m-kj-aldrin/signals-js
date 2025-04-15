import { defineConfig } from "vite";
import { resolve } from "path"; // This line should now work after installing @types/node

export default defineConfig({
  build: {
    lib: {
      // Ensure this points to your TypeScript entry file
      entry: resolve(__dirname, "src/index.ts"), // <--- CHANGE HERE
      name: "signals",
      fileName: () => "index.js", // Output JS file name
      formats: ["es"],
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {},
      },
    },
  },
});
