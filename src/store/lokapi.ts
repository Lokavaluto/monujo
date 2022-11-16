///<reference types="@types/node"/>
import { RestExc } from "@lokavaluto/lokapi-browser"

export function lokapiStoreFactory(lokApiService: any, gettext: any) {
  const transactionsBatchLength = 10
  const { $gettext, $ngettext } = gettext

  let transactionsGen = lokApiService.getTransactions()
  return {
    state: {
      status: "",
      userProfile: null,
      transactions: [],
      thisWeektransactions: [],
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
      transactionsLoading: true,
      transactionsLoadingError: false,
      transactionsBatchLoading: false,
    },
    actions: {
      async login(
        { commit, dispatch }: any,
        credentials: { login: string; password: string }
      ) {
        let { login, password } = credentials
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
        dispatch("resetTransactions")
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
      async resetTransactions({ commit, dispatch, state }: any) {
        commit("setTransactionsLoading", true)
        commit("setTransactionsLoadingError", false)
        let transactions: any = [],
          transactionsIndex = 0
        try {
          transactionsGen = lokApiService.getTransactions()
          let next = await transactionsGen.next()
          while (!next.done && transactionsIndex < transactionsBatchLength) {
            transactionsIndex++
            transactions.push(<any>next.value)
            next = await transactionsGen.next()
          }
        } catch (e: any) {
          console.error("Error fetching transactions", e)
          commit("setTransactionsLoadingError", true)
        }
        commit("setTransactions", transactions)
        commit("setTransactionsLoading", false)
      },
      async fetchTransactionsBatch({ commit, dispatch, state }: any) {
        let transactions =
            state.transactions.length > 0 ? state.transactions.slice(0) : [],
          transactionsIndex = 0
        commit("setTransactionsBatchLoading", true)
        let next = await transactionsGen.next()
        while (!next.done && transactionsIndex < transactionsBatchLength) {
          transactionsIndex++
          transactions.push(<any>next.value)
          next = await transactionsGen.next()
        }
        commit("setTransactionsBatchLoading", false)
        commit("setTransactions", transactions)
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
        return translatePwdFieldErrors(errors)
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
        dispatch("fetchTransactionsBatch")
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
        let hasRight = await lokApiService.hasUserAccountValidationRights()
        commit("setHasUserAccountValidationRights", hasRight)
      },
      async fetchPendingUserAccounts({ commit, state }: any) {
        let accounts = await lokApiService.getStagingUserAccounts()
        commit("setPendingUserAccounts", accounts)
      },
      async fetchCreditRequestValidationRights({ commit, state }: any) {
        let hasRight = await lokApiService.hasCreditRequestValidationRights()
        commit("setHasCreditRequestValidationRights", hasRight)
      },
      async fetchPendingCreditRequests({ commit, state }: any) {
        let requests = await lokApiService.getCreditRequests()
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
        state.transactions = []
        state.thisWeektransactions = []
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
        state.transactionsLoading = false
        state.transactionsLoadingError = false
      },

      setAccounts(state: any, { virtualAccountTree, allMoneyAccounts }: any) {
        state.virtualAccountTree = virtualAccountTree
        // Inform the UI if we are in a multi-currency display, note
        // we are testing the backend and not the currency symbol

        if (state.virtualAccountTree.length > 1) {
          let currencyId = state.virtualAccountTree[0].currencyId
          state.isMultiCurrency = state.virtualAccountTree
            .slice(1)
            .some((account: any) => account.currencyId !== currencyId)
        }

        // Warn the UI that account information are fully loaded
        state.moneyAccounts = allMoneyAccounts
        state.accountsLoaded = true
      },

      setTransactions(state: any, transactions: any[]) {
        var maxTransactions = 5
        let trs = []
        let history = []
        for (let el of transactions) {
          trs.push(el)
          history.push(el.related !== "Admin" ? el.related : null)
          if (maxTransactions === 1) {
            break
          }
          maxTransactions -= 1
        }

        state.transactions = transactions
        state.thisWeektransactions = trs
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
      setTransactionsLoading(state: any, loading: boolean) {
        state.transactionsLoading = loading
      },
      setTransactionsLoadingError(state: any, hasError: boolean) {
        state.transactionsLoadingError = hasError
      },
      setTransactionsBatchLoading(state: any, isLoading: boolean) {
        state.transactionsBatchLoading = isLoading
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

  function translatePwdFieldErrors(errors: string[]) {
    return errors.map((e: string) => {
      if (e.indexOf("tooShort") > -1) {
        const [_, nbChar] = e.split(":")
        const msgSizePassword = $ngettext(
          "%{ nbChar } character",
          "%{ nbChar } characters",
          parseInt(nbChar)
        )
        return $gettext("Password must be at least %{ msgSizePassword } long", {
          msgSizePassword,
        })
      } else if (e === "noLowerCase") {
        return $gettext("Password should use at least one lowercase character")
      } else if (e === "noUpperCase") {
        return $gettext("Password should use at least one uppercase character")
      } else if (e === "noDigit") {
        return $gettext("Password should use at least one digit")
      } else if (e === "noSymbol") {
        return $gettext("Password should use at least one symbol")
      }
    })
  }
}
