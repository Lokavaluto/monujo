import { defineConfig } from "cypress"

export default defineConfig({
  reporter: "mochawesome",
  // reporterOptions: {
  //   configFile: "reporter-config.json",
  // },
  reporterOptions: {
    reporterEnabled: "mochawesome",
    mochawesomeReporterOptions: {
      reportDir: "cypress/reports/mocha",
      overwrite: false,
      html: false,
      json: true,
    },
  },
  e2e: {
    baseUrl: "http://localhost:8080",
    experimentalStudio: true,
    defaultCommandTimeout: 5000,
    experimentalSessionAndOrigin: true,
  },
})
