import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Login from "../views/Login.vue";
import CreateMyAccount from "../views/CreateMyAccount.vue";
import PendingAccounts from "../views/admin/PendingAccounts.vue";
import PendingCredits from "../views/admin/PendingCredits.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/dashboard",
    name: "dashboard",
    meta: { title: "Tableau de bord" },
    component: Dashboard,
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
  {
    path: "/admin/pending-credits",
    name: "PendingCredits",
    meta: { title: "Validation des demandes de crédit" },
    component: PendingCredits,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
