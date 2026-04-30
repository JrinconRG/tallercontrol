import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
