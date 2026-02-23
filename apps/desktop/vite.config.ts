import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.join(__dirname, "../web"),
  base: "./",
  plugins: [react()],
  build: {
    outDir: path.join(__dirname, "web-dist"),
    emptyOutDir: true,
  },
});
