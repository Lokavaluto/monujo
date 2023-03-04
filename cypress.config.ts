import { defineConfig } from "cypress"

const rootDir = "tests/cypress"

export default defineConfig({
  // Files/Folder
  downloadsFolder: `${rootDir}/downloads`,
  fixturesFolder: `${rootDir}/fixtures`,
  screenshotsFolder: `${rootDir}/screenshots`,
  videosFolder: `${rootDir}/videos`,

  reporter: "node_modules/cypress-multi-reporters",
  env: {
    rootUrl: "http://localhost:8080/#/",
  },
  reporterOptions: {
    reporterEnabled: "mochawesome",
    mochawesomeReporterOptions: {
      reportDir: `${rootDir}/reports/mocha`,
      overwrite: false,
      html: false,
      json: true,
      video: false,
    },
  },
  e2e: {
    experimentalStudio: true,
    supportFile: `${rootDir}/support/e2e.ts`,
    specPattern: `${rootDir}/e2e/**/*.cy.ts`,
  },

  // If no baseUrl specified, cypress will serve these files:
  fileServerFolder: "dist/",
})
