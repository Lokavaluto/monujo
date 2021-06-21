import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
require("@/assets/main.scss");
// import { library } from "@fortawesome/fontawesome-svg-core";
// import { faCoffee } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";


// library.add(faCoffee);

// createApp(App)
//   .component("font-awesome-icon", FontAwesomeIcon)
//   .mount("#app");

createApp(App)
  .use(store)
  .use(router)
  .provide('$store', store)
  .mount("#app");
