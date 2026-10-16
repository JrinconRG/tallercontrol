import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        navigateFallbackDenylist: [/^\/rest\//, /^\/auth\//],
      },
      manifest: {
        name: "Sigec",
        short_name: "Sigec",
        description: "Gestión de procesos y nómina de taller",
        display: "standalone",
        orientation: "any",
        start_url: "/",
        scope: "/",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],

      include: ["src/**/*.{js,jsx,ts,tsx}"],

      exclude: [
        // e2e y tests
        "sigec-e2e/**",
        "src/test/**",

        "src/main.jsx",

        "src/components/layout/**",

        "src/components/DatePicker/**",
        "src/components/Stepper/**",
        "src/components/mostrarImagenModal/**",

        "src/pages/Gerente/Nomina/**",
      ],
    },
  },
});
