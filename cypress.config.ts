import { defineConfig } from "cypress"

const testDir = "tests/e2e"
const outputDir = ".cypress"

export default defineConfig({
  // Files/Folder
  fixturesFolder: `${testDir}/fixtures`,

  downloadsFolder: `${outputDir}/downloads`,
  screenshotsFolder: `${outputDir}/screenshots`,
  videosFolder: `${outputDir}/videos`,

  reporter: "node_modules/cypress-multi-reporters",
  env: {
    rootUrl: "http://localhost:8080/#/",
  },
  reporterOptions: {
    reporterEnabled: "mochawesome",
    mochawesomeReporterOptions: {
      reportDir: `${outputDir}/reports`,
      overwrite: false,
      html: false,
      json: true,
      video: false,
    },
  },
  e2e: {
    experimentalStudio: true,
    supportFile: `${testDir}/main.ts`,
    specPattern: `${testDir}/**/*.cy.ts`,
  },

  // If no baseUrl specified, cypress will serve these files:
  fileServerFolder: "dist/",
})
