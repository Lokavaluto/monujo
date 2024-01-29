///<reference types="@types/node"/>
import { RestExc } from "@lokavaluto/lokapi-browser"

export function lokapiStoreFactory(lokApiService: any, passwordUtils: any) {
  return {
    state: {
      status: "",
      userProfile: null,
      bal: 0,
      curr: "",
      virtualAccountTree: [],
      moneyAccounts: [],
      recipient: "",
      isLog: null,
      recipientHistory: [],
      isMultiCurrency: false, // Are we displaying accounts with different currencies ?
      backends: {},
      hasUserAccountValidationRights: false,
      pendingUserAccounts: [],
      hasCreditRequestValidationRights: false,
      pendingCreditRequests: [],
      accountsLoading: true,
      accountsLoadingError: false,
    },
    actions: {
      async login(
        { commit, dispatch }: any,
        credentials: { login: string; password: string }
      ) {
        const { login, password } = credentials
        commit("auth_request")
        try {
          await lokApiService.login(login, password)
        } catch (err: any) {
          commit("auth_error")
          throw err
        }
        dispatch("setupAfterLogin")
      },
      async setupAfterLogin({ commit, dispatch }: any) {
        try {
          commit("setUserProfile", await lokApiService.getMyContact())
        } catch (err) {
          commit("auth_error")
          if (err instanceof RestExc.TokenRequired) {
            return
          }
          throw err
        }
        dispatch("fetchAccounts")
        commit("auth_success")
        await dispatch("setBackends")
        dispatch("fetchUserAccountValidationRights")
        dispatch("fetchCreditRequestValidationRights")
      },
      async fetchAccounts({ commit }: any) {
        commit("setAccountsLoading", true)
        commit("setAccountsLoadingError", false)
        try {
          const { virtualAccountTree, allMoneyAccounts } =
            await lokApiService.buildVirtualAccountTree()
          commit("setAccounts", { virtualAccountTree, allMoneyAccounts })
        } catch (e: any) {
          console.error("Error fetching wallets", e)
          commit("setAccountsLoadingError", true)
        }
        commit("setAccountsLoading", false)
      },
      async genPaymentLink({ commit }: any, amount: number) {
        await commit("genPaymentLink", amount)
      },
      async askLogOut({ commit }: any) {
        await lokApiService.logout()
        commit("logout")
      },
      async checkPasswordStrength(
        { commit, state }: any,
        [password, accountBackend]: Array<string>
      ) {
        const backend = state.backends[accountBackend]
        const errors = await backend.isPasswordStrongEnough(password)
        return passwordUtils.translatePwdFieldErrors(errors)
      },
      async createUserAccount(
        { commit, state, dispatch }: any,
        [password, backendId]: Array<string>
      ) {
        const backend = state.backends[backendId]
        // Might throw some exception, leave it to the component
        // to display error messages.
        const userAccount = await backend.createUserAccount({ password })
        // XXXvlab: hopin' to provide a better way (and generalized)
        // to handle all caches in lokapi in an upcoming version.
        lokApiService.clearBackendCache()
        dispatch("setBackends")
        dispatch("fetchAccounts")
        return userAccount
      },
      async setBackends({ commit, state }: any) {
        try {
          commit("storeBackends", await lokApiService.getBackends())
        } catch (err: any) {
          console.error("Error getting currency backends", err)
          throw err
        }
      },
      async fetchUserAccountValidationRights({ commit, state }: any) {
        const hasRight = await lokApiService.hasUserAccountValidationRights()
        commit("setHasUserAccountValidationRights", hasRight)
      },
      async fetchPendingUserAccounts({ commit, state }: any) {
        const accounts = await lokApiService.getStagingUserAccounts()
        commit("setPendingUserAccounts", accounts)
      },
      async fetchCreditRequestValidationRights({ commit, state }: any) {
        const hasRight = await lokApiService.hasCreditRequestValidationRights()
        commit("setHasCreditRequestValidationRights", hasRight)
      },
      async fetchPendingCreditRequests({ commit, state }: any) {
        const requests = await lokApiService.getCreditRequests()
        commit("setPendingCreditRequests", requests)
      },
    },
    mutations: {
      auth_request(state: any) {
        state.status = "loading"
        state.isLog = false
      },
      auth_success(state: any) {
        state.status = "success"
        state.isLog = true
      },
      auth_error(state: any) {
        state.status = "error"
        state.isLog = false
      },
      logout(state: any) {
        state.status = ""
        state.apiToken = ""
        state.userProfile = null
        state.curr = ""
        state.virtualAccountTree = []
        state.moneyAccounts = []
        state.recipient = ""
        state.isLog = false
        state.isMultiCurrency = false
        state.hasUserAccountValidationRights = false
        state.pendingUserAccounts = []
        state.backends = {}
        state.hasCreditRequestValidationRights = false
        state.pendingCreditRequests = []
        state.accountsLoading = false
        state.accountsLoadingError = false
      },

      setAccounts(state: any, { virtualAccountTree, allMoneyAccounts }: any) {
        state.virtualAccountTree = virtualAccountTree
        // Inform the UI if we are in a multi-currency display, note
        // we are testing the backend and not the currency symbol

        if (state.virtualAccountTree.length > 1) {
          const currencyId = state.virtualAccountTree[0].currencyId
          state.isMultiCurrency = state.virtualAccountTree
            .slice(1)
            .some((account: any) => account.currencyId !== currencyId)
        }

        // Warn the UI that account information are fully loaded
        state.moneyAccounts = allMoneyAccounts
        state.accountsLoaded = true
      },

      storeBackends(state: any, backends: any) {
        state.backends = backends
      },
      setUserProfile(state: any, profile: any) {
        state.userProfile = profile
      },
      setHasUserAccountValidationRights(state: any, hasRight: boolean) {
        state.hasUserAccountValidationRights = hasRight
      },
      setPendingUserAccounts(state: any, accounts: Array<any>) {
        state.pendingUserAccounts = accounts
      },
      setHasCreditRequestValidationRights(state: any, hasRight: boolean) {
        state.hasCreditRequestValidationRights = hasRight
      },
      setPendingCreditRequests(state: any, requests: Array<any>) {
        state.pendingCreditRequests = requests
      },
      setAccountsLoading(state: any, loading: boolean) {
        state.accountsLoading = loading
      },
      setAccountsLoadingError(state: any, hasError: boolean) {
        state.accountsLoadingError = hasError
      },
    },
    getters: {
      getCurr: (state: any) => {
        return function (): string {
          return state.curr
        }
      },
      getAccs: (state: any) => {
        return function (): Array<any> {
          return state.virtualAccountTree
        }
      },
      getApiToken: (state: any) => {
        return function (): any {
          return state.apiToken
        }
      },
      hasUnconfiguredBackend: (state: any, getters: any) => {
        return function (): any {
          const unconfiguredBackends = getters.getUnconfiguredBackends()
          return unconfiguredBackends.length > 0
        }
      },
      getBackends: (state: any) => {
        return function (): any {
          return state.backends
        }
      },
      getUnconfiguredBackends: (state: any) => {
        return function (): object {
          return Object.entries(state.backends)
            .filter(
              ([_, backend]) =>
                Object.keys((<any>backend).userAccounts).length === 0 &&
                (<any>backend).createUserAccount
            )
            .map(([backendId, _]) => backendId)
        }
      },
      activeVirtualAccounts: (state: any) => {
        return state.virtualAccountTree.filter((a: any) => a.active === true)
      },
      inactiveVirtualAccounts: (state: any) => {
        return state.virtualAccountTree.filter((a: any) => a.active === false)
      },
      creditableMoneyAccounts: (state: any) => {
        return state.moneyAccounts.filter(
          (a: any) => a.active === true && a.creditable === true
        )
      },
      getOdooUrl: (state: any) => {
        return function (): any {
          return "https://" + lokApiService.host
        }
      },
      isAuthenticated: (state: any) => {
        return state.isLog
      },
    },
  }
}
