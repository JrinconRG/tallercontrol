import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "m8x6vk",
  e2e: {
    experimentalStudio: true,
    baseUrl: "http://localhost:5173/",
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    specPattern: "cypress/components/**/*.cy.{js,jsx}",
  },
});
