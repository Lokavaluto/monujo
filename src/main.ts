import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { lokapiStoreFactory } from "./store/lokapi"
import { LokAPI } from "./services/lokapiService"
import Toaster from "@meforma/vue-toaster";
import Swal from "./useSwal";
require("@/assets/main.scss");


if (!process.env.VUE_APP_LOKAPI_HOST) {
  throw new Error("Please specify VUE_APP_LOKAPI_HOST in '.env'")
}


if (!process.env.VUE_APP_LOKAPI_DB) {
  throw new Error("Please specify VUE_APP_LOKAPI_DB in '.env'")
}

if (!process.env.VUE_APP_MAP_URL) {
  throw new Error("Please specify VUE_APP_MAP_URL in '.env'")
}

const lokApiService = new LokAPI(
  process.env.VUE_APP_LOKAPI_HOST,
  process.env.VUE_APP_LOKAPI_DB,
)

store.registerModule("lokapi", lokapiStoreFactory(lokApiService))

const app = createApp(App)
  app.use(store)
  app.use(router)
  app.use(Swal)
  app.use(Toaster)
  app.provide('$store', store)
  app.config.globalProperties.$lokapi = lokApiService
  app.mount("#app");
