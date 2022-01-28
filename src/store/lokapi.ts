/* eslint-disable */

///<reference types="@types/node"/>

import Swal from "sweetalert2"
import { lokApiService } from "../services/lokapiService"


export var moduleLokAPI = {
  state: {
    status: '',
    userProfile: null,
    transactions: null,
    thisWeektransactions:null,
    bal: 0,
    curr:"",
    accounts:[],
    accountsLoaded: false,
    recipient:"",
    isLog:false,
    paymentUrl: "",
    recipientHistory:[],
    isMultiCurrency: false,  // Are we displaying accounts with different currencies ?
    backends: {},
    hasUserAccountValidationRights: false,
    pendingUserAccounts: [],
  },
  actions: {
    async login({ commit, dispatch }: any, credentials: { login: string, password: string }) {
      let { login, password } = credentials
      commit('auth_request')
      try {
        await lokApiService.login(login, password)
      } catch (err:any) {
        commit('auth_error')
        throw err
      }
      await dispatch('setBackends')

      commit("setThisWeekTransactions")
      commit('setUserProfile', await lokApiService.getMyContact())
      commit('auth_success')
      dispatch('fetchUserAccountValidationRights')
    },
    async resetTRS({commit} :any) {
      await commit("setThisWeekTransactions")
    },
    async initAutoLogin({commit, dispatch}:any) {
      commit('setUserProfile', await lokApiService.getMyContact())
      commit('auth_success')
      await dispatch('setBackends')
      dispatch('fetchUserAccountValidationRights')
    },
    async setAccounts({commit}:any) {
      await commit("setBalCurr")
      await commit("setThisWeekTransactions")
    },
    async genPaymentLink({commit}:any,amount:number) {
      await commit("genPaymentLink", amount)
    },
    askLogOut({commit}:any) {
      commit("logout")
    },
    async checkPasswordStrength({ commit, state }:any, [password, accountBackend]: Array<string>) {
      const backend = state.backends[accountBackend]
      const errors = await backend.isPasswordStrongEnough(password)
      return translatePwdFieldErrors(errors)
    },
    async createUserAccount({ commit, state, dispatch }:any, [password, backendId]: Array<string>) {
      const backend = state.backends[backendId]
      // Might throw some exception, leave it to the component
      // to display error messages.
      await backend.createUserAccount({ password })
      // XXXvlab: hopin' to provide a better way (and generalized)
      // to handle all caches in lokapi in an upcoming version.
      lokApiService.clearBackendCache()
      dispatch('setBackends')
      await commit("setBalCurr")
      await commit("setThisWeekTransactions")
    },
    async setBackends({ commit, state }:any) {
      try {
        commit('storeBackends', await lokApiService.getBackends())
      } catch (err:any) {
        console.error('Error getting currency backends', err)
        throw err
      }
    },
    async fetchUserAccountValidationRights({ commit, state }:any) {
      let hasRight = await lokApiService.hasUserAccountValidationRights()
      commit('setHasUserAccountValidationRights', hasRight)
    },
    async fetchPendingUserAccounts({ commit, state }:any) {
      let accounts = await lokApiService.getStagingUserAccounts()
      commit('setPendingUserAccounts', accounts)
    }

  },
  mutations: {
    async genPaymentLink(state: any, amount:number) {
      state.paymentUrl = await state.accounts[0].getCreditUrl(amount)
      // console.log("paymentUrl url =", state.paymentUrl.order_url)
    },
    auth_request(state: any) {
      state.status = 'loading'
      state.isLog = false
    },
    auth_success(state: any) {
      state.status = 'success'
      state.isLog = true;
    },
    auth_error(state: any) {
      state.status = 'error'
      state.isLog = false
    },
    logout(state: any) {
      state.status = ''
      state.apiToken = ''
      state.status= ''
      state.userProfile= null
      state.transactions=null
      state.thisWeektransactions=null
      state.curr=""
      state.accounts=[]
      state.accountsLoaded=false
      state.recipient=""
      state.isLog=false
      state.paymentUrl=""
      state.isMultiCurrency = false
      state.hasUserAccountValidationRights = false
      state.pendingUserAccounts = []
    },

    async setBalCurr(state:any) {
      await lokApiService.buildAccountsInplace(state.accounts)

      // Inform the UI if we are in a multi-currency display, note
      // we are testing the backend and not the currency symbol

      if (state.accounts.length > 1) {
        let currencyId = state.accounts[0].currencyId
        state.isMultiCurrency = state.accounts.slice(1).some(
          (account: any) => account.currencyId !== currencyId
        )
      }

      // Warn the UI that account information are fully loaded
      state.accountsLoaded = true
    },

    async setThisWeekTransactions (state:any) {
      let transactionsGen = lokApiService.getTransactions()

      let transactions = []
      let next = await transactionsGen.next()
      while (!next.done) {
        transactions.push(<any>next.value)
        next = await transactionsGen.next()
      }
      state.transactions = transactions 
      var maxTransactions = 5
      let trs = []
      let history = []
      for (let el of transactions) {
        trs.push(el)
        history.push(el.relatedUser ? el.relatedUser.display : null)
        if (maxTransactions === 1) {
            break;
        }
        maxTransactions -= 1
      }
      var filtered = history.filter(function (el) {
        return el != null;
      });
      state.recipientHistory = [...new Set(filtered)];
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
    }
  },
  getters: {
    getCurr: (state: any) => {
      return function(): string {
        return state.curr
      }
    },
    getAccs: (state: any) => {
      return function(): Array<any> {
        return state.accounts
      }
    },
    getApiToken: (state: any) => {
      return function(): any {
        return state.apiToken
      }
    },
    hasUnconfiguredBackend: (state: any, getters: any) => {
      return function(): any {
        let unconfiguredBackends = getters.getUnconfiguredBackends()
        return unconfiguredBackends.length > 0
      }
    },
    getUnconfiguredBackends: (state: any) => {
      return function(): object {
        return Object.entries(state.backends).filter(
          ([_, backend]) => (
            Object.keys((<any>backend).userAccounts).length === 0 &&
              (<any>backend).createUserAccount
          )
        ).map(
          ([backendId, _]) => backendId
        )
      }
    },
    activeMoneyAccounts: (state:any) => {
      return state.accounts.filter((a: any) => a.active === true)
    },
    inactiveMoneyAccounts: (state: any) => {
      return state.accounts.filter((a: any) => a.active === false)
    },
    getOdooUrl: (state: any) => {
      return function(): any {
        return 'https://' + lokApiService.host
      }
    },
  }
}

function translatePwdFieldErrors(errors: string[]) {
  return errors.map((e: string) => {
    if (e.indexOf('tooShort') > -1) {
      let segments = e.split(':')
      return "Le mot de passe doit faire au moins " + segments[1] + ' caractères'
    } else if (e === 'noLowerCase') {
      return "Le mot de passe doit contenir au moins une lettre minuscule"
    } else if (e === 'noUpperCase') {
      return "Le mot de passe doit contenir au moins une lettre majuscule"
    } else if (e === 'noDigit') {
      return "Le mot de passe doit contenir au moins un nombre"
    } else if (e === 'noSymbol') {
      return "Le mot de passe doit contenir au moins un caractère spécial"
    }
  })
}
