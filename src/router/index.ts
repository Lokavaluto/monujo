import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Profile from "../views/Profile.vue";
import Login from "../views/Login.vue";
import Administration from "../views/Administration.vue";

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
    path: "/admin",
    name: "Administration",
    meta: { title: "Administration" },
    component: Administration,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
