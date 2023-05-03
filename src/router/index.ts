import { createRouter, createWebHashHistory } from "vue-router"
import Dashboard from "../views/Dashboard.vue"
import Carto from "../views/Carto.vue"
import Login from "../views/Login.vue"
import CreateMyAccount from "../views/CreateMyAccount.vue"
import PendingAccounts from "../views/admin/PendingAccounts.vue"
import PendingCredits from "../views/admin/PendingCredits.vue"
import Prefs from "../views/Prefs.vue"
import ResetPassword from "../views/ResetPassword.vue"
import Signup from "../views/Signup.vue"

export function mkRouter(appName: string, store: any, gettext: any): any {
  const { $gettext } = gettext
  const router = createRouter({
    history: createWebHashHistory(),
    routes: [
      {
        path: "/dashboard",
        name: "dashboard",
        meta: { title: $gettext("Dashboard") },
        component: Dashboard,
      },
      {
        path: "/carto",
        name: "Carto",
        meta: { title: $gettext("Map") },
        component: Carto,
      },
      {
        path: "/",
        name: "Login",
        meta: { title: $gettext("Login") },
        component: Login,
      },
      {
        path: "/reset-password",
        name: "Reset password",
        meta: { title: $gettext("Reset my password") },
        component: ResetPassword,
      },
      {
        path: "/signup",
        name: "Signup",
        meta: { title: $gettext("Sign-Up") },
        component: Signup,
      },
      {
        path: "/create-account",
        name: "Create my account",
        meta: { title: $gettext("Create my wallet") },
        component: CreateMyAccount,
      },
      {
        path: "/preferences",
        name: "Preferences",
        meta: { title: $gettext("Preferences") },
        component: Prefs,
      },
      {
        path: "/admin/pending-accounts",
        name: "Validate-account",
        meta: { title: $gettext("Approval of account creation") },
        component: PendingAccounts,
      },
      {
        path: "/admin/pending-credits",
        name: "Pending Credits",
        meta: { title: $gettext("Approval of top-up requests") },
        component: PendingCredits,
      },
      {
        path: "/:pathMatch(.*)*",
        component: Carto,
      },
    ],
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
