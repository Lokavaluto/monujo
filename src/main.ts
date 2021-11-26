import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { lokApiService } from "./services/lokapiService"
import Toaster from "@meforma/vue-toaster";
import Swal from "./useSwal";
require("@/assets/main.scss");
// import { library } from "@fortawesome/fontawesome-svg-core";
// import { faCoffee } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
// library.add(faCoffee);

const app = createApp(App)
  app.use(store)
  app.use(router)
  app.use(Swal)
  app.use(Toaster)
  app.provide('$store', store)
  app.config.globalProperties.$lokapi = lokApiService
  app.mount("#app");
