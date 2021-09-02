import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { lokAPI } from "./store/lokapi";
import Toaster from "@meforma/vue-toaster";
import Swal from "./useSwal";
require("@/assets/main.scss");
// import { library } from "@fortawesome/fontawesome-svg-core";
// import { faCoffee } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";


// library.add(faCoffee);
// createApp(App)
//   .component("font-awesome-icon", FontAwesomeIcon)
//   .mount("#app");
const app = createApp(App)
  app.use(store)
  app.use(router)
  app.use(Swal)
  app.use(Toaster)
  app.provide('$lokapi', lokAPI)
  app.provide('$store', store)
  // app.config.globalProperties.$store = store
  app.mount("#app");

// createApp(App)
//   .use(store)
//   .use(router)
//   .provide('$lokapi', lokAPI)
//   .provide('$store', store)
//   .mount("#app");


