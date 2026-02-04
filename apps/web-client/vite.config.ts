import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
  },
  define: {
    // Basic compatibility for some RN libraries
    global: "window",
  },
  server: {
    port: 5175,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-native-web")) return "rnweb";
            if (id.includes("socket.io-client")) return "socket";
            if (id.includes("/firebase/") || id.includes("firebase"))
              return "firebase";
          }
          if (id.includes("/packages/ui/")) return "tt-ui";
          if (id.includes("/packages/core/")) return "tt-core";
          return undefined;
        },
      },
    },
  },
});
