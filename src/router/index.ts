import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Profile from "../views/Profile.vue";
import Login from "../views/Login.vue";
import { useStore } from "vuex";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/profile",
    name: "Profile",
    meta: { title: "Tableau de bord" },
    component: Profile,
  },
  {
    path: "/",
    name: "Login",
    meta: { title: "Connection" },
    component: Login,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
