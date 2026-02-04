import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "react-native": "react-native-web",
    },
  },
  define: {
    global: "window",
  },
  server: {
    port: 5176,
  },
  esbuild: {
    drop: ["console", "debugger"],
  },
  build: {
    // The only remaining big chunk is the optional PDF renderer, which is lazy-loaded.
    // Bump the warning limit slightly to avoid noise while keeping other warnings meaningful.
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-native-web")) return "rnweb";
            if (id.includes("socket.io-client")) return "socket";
            if (id.includes("@react-pdf")) return "pdf";

            // Generic vendor chunking to avoid a single huge shared chunk
            const parts = id.split("node_modules/");
            const pkgPath = parts[parts.length - 1] || "";
            const pkgName = pkgPath.startsWith("@")
              ? pkgPath.split("/").slice(0, 2).join("__")
              : pkgPath.split("/")[0];
            const deny = new Set([
              "void-elements",
              "html-parse-stringify",
              "is-url",
              "postcss-value-parser",
              "cookie",
              "set-cookie-parser",
            ]);
            if (pkgName && !deny.has(pkgName)) {
              return `vendor_${pkgName.replace(/[^a-zA-Z0-9_]/g, "_")}`;
            }
          }
          // Split internal workspace packages into their own chunks when possible
          if (id.includes("/packages/ui/")) return "tt-ui";
          if (id.includes("/packages/core/")) return "tt-core";
          return undefined;
        },
      },
    },
  },
});
