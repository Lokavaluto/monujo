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
    chromeWebSecurity: false,
    // XXXvlab: from https://www.cypress.io/blog/2021/03/01/generate-high-resolution-videos-and-screenshots/
    setupNodeEvents(on, config) {
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (!config.env.screenshot) return launchOptions

        // the browser width and height we want to get
        // our screenshots and videos will be of that resolution
        const width = config.viewportWidth
        const height = config.viewportHeight

        console.log("setting the browser window size to %d x %d", width, height)

        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args.push(`--window-size=${width},${height}`)

          // force screen to be non-retina and just use our given resolution
          launchOptions.args.push(
            `--force-device-scale-factor=${config.env.scaleFactor || 1}`
          )
        }

        if (browser.name === "electron" && browser.isHeadless) {
          // might not work on CI for some reason
          launchOptions.preferences.width = width
          launchOptions.preferences.height = height
          if (config.env.scaleFactor !== 1) {
            throw new Error(
              `A scaleFactor of ${config.env.scaleFactor} is not supported ` +
                `on ${browser.name}. Please consider using 'chrome' as ` +
                `browser for making screenshots.`
            )
          }
        }

        if (browser.name === "firefox" && browser.isHeadless) {
          launchOptions.args.push(`--width=${width}`)
          launchOptions.args.push(`--height=${height}`)
          if (config.env.scaleFactor !== 1) {
            throw new Error(
              `A scaleFactor of ${config.env.scaleFactor} is not supported ` +
                `on ${browser.name}. Please consider using 'chrome' as ` +
                `browser for making screenshots.`
            )
          }
        }

        return launchOptions
      })
    },
  },

  // If no baseUrl specified, cypress will serve these files:
  fileServerFolder: "dist/",
})
