import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { lokapiStoreFactory } from "./store/lokapi"
import { LokAPI } from "./services/lokapiService"
import Toaster from "@meforma/vue-toaster";
import Swal from "./useSwal";
import { httpRequest } from "@0k.io/node-request"

require("@/assets/main.scss");


async function fetchConfig(path: string) {
  const cur = window.location
  let response
  try {
    response = await httpRequest({
      protocol: cur.protocol.slice(0, -1),
      host: cur.hostname,
      port: parseInt(cur.port),
      method: "GET",
      path
    })
  } catch (error) {
    console.log(`Failed to load config file '${path}'.`)
    throw error
  }
  if (typeof(response) !== "string") {
    throw new Error(
       "Unexpected response while loading config file.")
  }
  try {
    return JSON.parse(response)
  } catch (error) {
    console.error(`File '${path}' was loaded, but doesn't contain valid json.`)
    throw error
  }
}


fetchConfig("/config.json").then((config: any) => {

  if (!config.lokapiHost) {
    throw new Error("Please specify lokapiHost in 'config.json'")
  }

  if (!config.lokapiDb) {
    throw new Error("Please specify lokapiDb in 'config.json'")
  }

  const lokApiService = new LokAPI(
    config.lokapiHost,
    config.lokapiDb,
  )

  store.registerModule("lokapi", lokapiStoreFactory(lokApiService))

  const app = createApp(App)
  app.use(store)
  app.use(router)
  app.use(Swal)
  app.use(Toaster)
  app.provide('$store', store)
  app.config.globalProperties.$lokapi = lokApiService
  app.config.globalProperties.$config = config
  app.mount("#app")
})
