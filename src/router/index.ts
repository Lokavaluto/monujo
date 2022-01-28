import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Profile from "../views/Profile.vue";
import Login from "../views/Login.vue";
import CreateMyAccount from "../views/CreateMyAccount.vue";
import PendingAccounts from "../views/admin/PendingAccounts.vue";

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
    path: "/create-account",
    name: "Create my account",
    meta: { title: "Créer mon portefeuille" },
    component: CreateMyAccount,
  },
  {
    path: "/admin/pending-accounts",
    name: "Validate-account",
    meta: { title: "Validation des comptes en attente de création" },
    component: PendingAccounts,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
