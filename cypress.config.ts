import { defineConfig } from "cypress"
import webpackPreprocessor from '@cypress/webpack-preprocessor'

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
    setupNodeEvents(on, config) {
      // Solve bug about `sourceMap` typescript option conflict
      // https://github.com/cypress-io/cypress/issues/26203
      on("file:preprocessor", webpackPreprocessor({
        webpackOptions: {
          resolve: {
            extensions: ['.js', '.json', '.ts'],
          },
          module: {
            rules: [
              {
                test: /\.tsx?$/,
                exclude: [/node_modules/],
                use: [
                  {
                    loader: 'ts-loader',
                    options: {
                      compilerOptions: {
                        //inlineSourceMap: true,
                        inlineSources: true,
                        downlevelIteration: true,
                      },
                      logLevel: 'error',
                      silent: true,
                      transpileOnly: true,
                    },
                  },
                ],
              }
            ]
          }
        },
      }))
      // XXXvlab: from https://www.cypress.io/blog/2021/03/01/generate-high-resolution-videos-and-screenshots/
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (!config.env.screenshot) return launchOptions

        // the browser width and height we want to get
        // our screenshots and videos will be of that resolution
        const width = config.viewportWidth
        const height = config.viewportHeight
        const scaleFactor = config.env.scaleFactor || 1

        console.log("setting the browser window size to %d x %d x %d", width, height, scaleFactor)

        if (browser.name === "chrome" && browser.isHeadless) {
          launchOptions.args = launchOptions.args.filter(
            (arg) => !arg.startsWith("--window-size=") &&
              !arg.startsWith("--force-device-scale-factor=") &&
              !arg.startsWith("--headless=")
          )
          // --headless=new is quirky and does not respect height
          // see: https://github.com/cypress-io/cypress/issues/27260

          launchOptions.args.push("--headless=old")
          launchOptions.args.push(`--window-size=${width},${height}`)
          // force screen to be non-retina and just use our given resolution
          launchOptions.args.push(`--force-device-scale-factor=${scaleFactor}`)
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
