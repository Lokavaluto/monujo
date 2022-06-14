import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import { lokapiStoreFactory } from "./store/lokapi"
import { LokAPI } from "./services/lokapiService"
import Toaster from "@meforma/vue-toaster"
import Swal from "./useSwal"
import "./polyfill"

require("@/assets/main.scss")
require("@/assets/native.scss")

const defaultAppName = require("../package.json").name

declare global {
  var appName: string;
}

async function fetchConfig(path: string) {
  let response: Response

  // This allows us to store the config given at build time
  // for the mobile apps compilation
  try {
    response = await fetch(path)
  } catch (error) {
    console.log(`Failed to load config file '${path}'.`)
    throw error
  }

  try {
    return JSON.parse(await response.text())
  } catch (error) {
    console.error(`File '${path}' was loaded, but doesn't contain valid json.`)
    throw error
  }
}

fetchConfig("config.json").then((config: any) => {
  if (!config.lokapiHost) {
    throw new Error("Please specify lokapiHost in 'config.json'")
  }

  globalThis.appName = config.appName || defaultAppName

  const lokApiService = new LokAPI(
    config.lokapiHost,
    config.lokapiDb,
    config?.localPasswordRetentionTime
  )

  const root = document.querySelector(":root") as HTMLElement

  if (root !== null && typeof config.theme === "object") {
    Object.entries(config.theme).forEach(([key, value]: [string, any]) => {
      if (typeof value !== "string") {
        if (typeof value.toString !== "undefined") {
          value = value.toString()
        } else {
          console.warn(
            `Ignored invalid value for key '${key}' in config.json:`,
            value
          )
          return
        }
      }
      // Provide a simple way to refer to other variables in
      // ``config.json``, by using "$var" syntax.
      if (value.startsWith("$")) {
        value = `var(--${value.substring(1)})`
      }
      root.style.setProperty(`--${key}`, value)
    })
  }
  store.registerModule("lokapi", lokapiStoreFactory(lokApiService))

  const app = createApp(App)
  app.use(store)
  app.use(router)
  app.use(Swal)
  app.use(Toaster)
  app.provide("$store", store)
  app.config.globalProperties.$lokapi = lokApiService
  app.config.globalProperties.$config = config
  app.mount("#app")
})
