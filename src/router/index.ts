import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Profile from "../views/Profile.vue";
import Login from "../views/Login.vue";
import Administration from "../views/Administration.vue";
import CreateMyWallet from "../views/CreateMyWallet.vue";

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
  {
    path: "/create-wallet",
    name: "Create my wallet",
    meta: { title: "Créer mon portefeuille" },
    component: CreateMyWallet,
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
