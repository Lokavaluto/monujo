import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Profile from "../views/Profile.vue";
import Login from "../views/Login.vue";
import Carto from "../views/Carto.vue";

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
  {
    path: "/carto",
    name: "Carto",
    meta: { title: "Carto" },
    component: Carto,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
