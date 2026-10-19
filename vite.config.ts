// Client build (BUILD). The single-page client is served by the Fastify server in
// production; in development Vite proxies /api to it.
import preact from "@preact/preset-vite";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/browser",
  publicDir: false,
  plugins: [preact()],
  build: { outDir: "../../dist/client", emptyOutDir: true, sourcemap: true },
  server: {
    port: 5173,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:5174", "/health": "http://127.0.0.1:5174" },
  },
});
