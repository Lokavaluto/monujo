import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import Dashboard from "../views/Dashboard.vue"
import Carto from "../views/Carto.vue"
import Login from "../views/Login.vue"
import CreateMyAccount from "../views/CreateMyAccount.vue"
import PendingAccounts from "../views/admin/PendingAccounts.vue"
import PendingCredits from "../views/admin/PendingCredits.vue"
import Prefs from "../views/Prefs.vue"
import ResetPassword from "../views/ResetPassword.vue"
import Signup from "../views/Signup.vue"

const routes: Array<RouteRecordRaw> = [
  {
    path: "/dashboard",
    name: "dashboard",
    meta: { title: "Tableau de bord" },
    component: Dashboard,
  },
  {
    path: "/carto",
    name: "Carto",
    meta: { title: "Carto" },
    component: Carto,
  },
  {
    path: "/",
    name: "Login",
    meta: { title: "Connection" },
    component: Login,
  },
  {
    path: "/reset-password",
    name: "Reset password",
    meta: { title: "Ré-initialiser mon mot de passe" },
    component: ResetPassword,
  },
  {
    path: "/signup",
    name: "Signup",
    meta: { title: "Créer mon compte" },
    component: Signup,
  },
  {
    path: "/create-account",
    name: "Create my account",
    meta: { title: "Créer mon portefeuille" },
    component: CreateMyAccount,
  },
  {
    path: "/preferences",
    name: "Preferences",
    meta: { title: "Préferences" },
    component: Prefs,
  },
  {
    path: "/admin/pending-accounts",
    name: "Validate-account",
    meta: { title: "Validation des comptes en attente de création" },
    component: PendingAccounts,
  },
  {
    path: "/admin/pending-credits",
    name: "Pending Credits",
    meta: { title: "Validation des demandes de crédit" },
    component: PendingCredits,
  },
  {
    path: "/:pathMatch(.*)*",
    component: Carto,
  },
]

export function mkRouter(appName: string, store: any): any {
  const router = createRouter({
    history: createWebHashHistory(),
    routes,
  })

  // Authentication guard
  router.beforeEach((to, from, next) => {
    if (
      to.name !== "Login" &&
      to.name !== "Carto" &&
      to.name !== "Reset password" &&
      to.name !== "Signup" &&
      !store.getters.isAuthenticated
    )
      next({ name: "Carto" })
    else if (to.name === "Login" && store.getters.isAuthenticated)
      next({ name: "dashboard" })
    else next()
  })
  router.beforeEach((to, from, next) => {
    if (typeof to.meta.title === "string") {
      document.title = appName + " - " + to.meta.title
    }
    next()
  })
  return router
}
