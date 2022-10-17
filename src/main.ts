import { LocalStore } from "@lokavaluto/lokapi-browser"
import { createApp } from "vue"
import "vue-loading-overlay/dist/vue-loading.css"

import { UIError } from "./exception"
import App from "./App.vue"
import { mkRouter } from "./router"
import "./polyfill"

// Store

import mkStore from "./store"
import { lokapiStoreFactory } from "./store/lokapi"
import { prefsStoreFactory } from "./store/prefs"

// Services

import {
  AuthService,
  PinAuthHandler,
  RetentionAuthHandler,
  DirectAuthHandler,
  PersistentConfigStore,
} from "@/services/AuthService"
import PrefsService from "@/services/PrefsService"
import ExportService from "@/services/ExportService"
import AuthPrefs from "@/components/AuthPrefs.vue"
import LangPrefs from "@/components/LangPrefs.vue"

import Dialog from "@/services/Dialog"
import ToastService from "@/services/toastService"
import { LokAPI } from "./services/lokapiService"
import mkGettext from "./services/Gettext"

// Components

import AuthPrefDirect from "@/components/AuthPrefDirect.vue"
import AuthPrefRetention from "@/components/AuthPrefRetention.vue"
import AuthPrefPin from "@/components/AuthPrefPin.vue"
import AuthChallengeRetention from "@/components/AuthChallengeRetention.vue"
import AuthChallengeDirect from "@/components/AuthChallengeDirect.vue"
import AuthChallengePin from "@/components/AuthChallengePin.vue"

// Plugins

import Loading from "./plugins/loading"

// Assets

import FontAwesomeIcon from "@/utils/fonts"
require("@/assets/main.scss")
require("@/assets/native.scss")

// Code

async function fetchConfig(path: string) {
  let response: Response

  // This allows us to store the config given at build time
  // for the mobile apps compilation
  try {
    response = await fetch(path)
  } catch (error) {
    console.log(`Failed to load config file '${path}'.`)
    throw error
  }

  try {
    return JSON.parse(await response.text())
  } catch (error) {
    console.error(`File '${path}' was loaded, but doesn't contain valid json.`)
    throw error
  }
}

fetchConfig("config.json").then(async (config: any) => {
  if (!config.lokapiHost) {
    throw new Error("Please specify lokapiHost in 'config.json'")
  }

  const defaultAppName = require("../package.json").name
  const dialog = new Dialog()
  const lokApiService = new LokAPI(config.lokapiHost, config.lokapiDb)
  const localSettings = new PersistentConfigStore(
    lokApiService.persistentStore,
    "localSettings"
  )
  const gettext = await mkGettext(config?.locales || {}, localSettings || {})
  const store = await mkStore(config?.locales || {}, gettext)
  const router = mkRouter(config.appName || defaultAppName, store)

  const { $gettext } = gettext

  lokApiService.requestLogin = async () => {
    const lastUrlSegment = window.location.href.split("/").pop()
    if (lastUrlSegment !== "carto" && lastUrlSegment !== "") {
      console.log("Login requested !")
      await store.dispatch("askLogOut")
      router.push("/")
    }
  }

  lokApiService.getBankAccountName = async (bankAccount: any) => {
    if (bankAccount.getDisplayName) {
      return await bankAccount.getDisplayName()
    }
    const backend = bankAccount.internalId.split(":")[0]
    if (backend === "comchain" && bankAccount.type) {
      return bankAccount.type === "Nant"
        ? () => $gettext("Pledged account")
        : () => $gettext("Mutual credit")
    }
    return () => $gettext("Main account")
  }

  const root = document.querySelector(":root") as HTMLElement

  if (root !== null && typeof config.theme === "object") {
    Object.entries(config.theme).forEach(([key, value]: [string, any]) => {
      if (typeof value !== "string") {
        if (typeof value.toString !== "undefined") {
          value = value.toString()
        } else {
          console.warn(
            `Ignored invalid value for key '${key}' in config.json:`,
            value
          )
          return
        }
      }
      // Provide a simple way to refer to other variables in
      // ``config.json``, by using "$var" syntax.
      if (value.startsWith("$")) {
        value = `var(--${value.substring(1)})`
      }
      root.style.setProperty(`--${key}`, value)
    })
  }
  if (root !== null && typeof config.css === "string") {
    const sheet = document.createElement("style")
    sheet.innerHTML = config.css
    document.body.appendChild(sheet)
  }

  const authService = new AuthService(
    config?.localAuthPolicy,
    new PersistentConfigStore(lokApiService.persistentStore, "config"),
    {
      Pin: {
        Handler: PinAuthHandler,
        Ui: {
          Pref: AuthPrefPin,
          Challenge: AuthChallengePin,
        },
      },
      Direct: {
        Handler: DirectAuthHandler,
        Ui: {
          Pref: AuthPrefDirect,
          Challenge: AuthChallengeDirect,
        },
      },
      Retention: {
        Handler: RetentionAuthHandler,
        Ui: {
          Pref: AuthPrefRetention,
          Challenge: AuthChallengeRetention,
        },
      },
    }
  )

  const prefsService = new PrefsService()
  prefsService.setGroup("security", () => $gettext("Security settings"))
  prefsService.register(async () => {
    const userAccounts = await lokApiService.getUserAccountsRequiringUnlock()
    if (userAccounts.length == 0) {
      return []
    }
    return [
      {
        group: "security",
        component: AuthPrefs,
        data: {
          userAccountsRequiringAuth: userAccounts,
        },
      },
    ]
  })

  prefsService.setGroup("language", () => $gettext("Language settings"))
  prefsService.register(async () => {
    if (Object.keys(gettext.available).length <= 1) {
      return []
    }
    return [
      {
        group: "language",
        component: LangPrefs,
      },
    ]
  })

  lokApiService.requestLocalPassword = async function (
    state: string,
    userAccount: any
  ) {
    if (store.state.requestLoadingAfterCreds && state === "failedUnlock") {
      app.config.globalProperties.$loading.hide()
    }
    const accountAuthService = await authService.getAccountAuth(
      userAccount.internalId
    )
    const creds = await accountAuthService.requestCredentials(state)
    if (store.state.requestLoadingAfterCreds) {
      app.config.globalProperties.$loading.show()
    }
    return creds
  }

  store.registerModule("lokapi", lokapiStoreFactory(lokApiService, gettext))
  store.registerModule("prefs", prefsStoreFactory(prefsService))

  const app = createApp(App)
  app.config.errorHandler = function (err: any, vm, info) {
    if (err instanceof UIError) {
      ToastService.error(err.message)
      throw err.origException
    }
    throw err
  }

  app.use(store)
  app.use(Loading)
  app.use(gettext)
  app.use(dialog)
  app.provide("$store", store)
  app.component("fa-icon", FontAwesomeIcon)
  app.config.globalProperties.$auth = authService
  app.config.globalProperties.$lokapi = lokApiService
  app.config.globalProperties.$config = config
  app.config.globalProperties.$localSettings = localSettings
  app.config.globalProperties.$msg = ToastService
  app.config.globalProperties.$persistentStore = new LocalStore("monujo")
  app.config.globalProperties.$auth = authService
  app.config.globalProperties.$prefs = prefsService
  app.config.globalProperties.$export = new ExportService(gettext)
  app.config.globalProperties.$errorHandler = app.config.errorHandler

  const unwatch = store.watch(
    (state, getters) => getters.isAuthenticated,
    () => {
      app.use(router)
      app.mount("#app")
      unwatch()
    }
  )

  store.dispatch("setupAfterLogin")
})
