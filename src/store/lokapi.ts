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
    accountsStatus: 'loaded',
    recipient:"",
    isLog:false,
    paymentUrl: "",
    recipientHistory:[],
    isMultiCurrency: false,  // Are we displaying accounts with different currencies ?
    backends: {},
  },
  actions: {
    async login({ commit, dispatch }: any, credentials: { login: string, password: string }) {
      let { login, password } = credentials
      commit('auth_request')
      try {
        await lokApiService.login(login, password)
        commit('auth_success')
      } catch (err:any) {
        commit('auth_error')
        throw err
      }

    },
    async resetTRS({commit} :any) {
      await commit("setThisWeekTransactions")
    },
    async initAutoLogin({commit, dispatch}:any) {
      try {
        commit('auth_success')
        dispatch("fetchUserProfile")
        dispatch("fetchUserAccounts")
        dispatch("fetchBackends")
        dispatch("fetchUserTransactions")
      } catch (err:any) {
        console.error(err)
      }
    },
    async fetchUserProfile({ commit }:any) {
      try {
        let profile = await lokApiService.getMyContact()
        commit("setUserProfile", profile)
      } catch (err:any) {
        console.error('Cannot fetch user profile data', err)
        throw err
      }
    },
    async fetchUserAccounts({commit}:any) {
      commit('setUserAccountsListStatus', 'loading')
      let accounts: Array<object> = []
      await lokApiService.buildAccountsInplace(accounts)
      commit("setUserAccounts", accounts)
      // Warn the UI that account information are fully loaded
      commit('setUserAccountsListStatus', 'loaded')
    },
    async genPaymentLink({ commit, state }:any, amount:number) {
      console.log(state.accounts)
      // state.paymentUrl = await state.accounts[0].getCreditUrl(amount)
      // console.log("paymentUrl url =", state.paymentUrl.order_url)
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
      dispatch("fetchUserAccounts")
      dispatch('fetchBackends')
      dispatch("fetchUserTransactions")
    },
    async fetchBackends({ commit, state }:any) {
      try {
        commit('setBackends', await lokApiService.getBackends())
      } catch (err:any) {
        console.error('Error getting currency backends', err)
        throw err
      }
    },
    async fetchUserTransactions({ commit, state }:any) {
      try {
        let transactionsGen = await lokApiService.getTransactions()
        let transactions = []
        let next = await transactionsGen.next()
        while (!next.done) {
          transactions.push(<any>next.value)
          next = await transactionsGen.next()
        }
        commit('setUserTransactions', transactions)
      } catch (err:any) {
        console.error('Error getting user transactions', err)
        throw err
      }
    }

  },
  mutations: {
    auth_request(state: any) {
      state.status = 'loading'
    },
    auth_success(state: any) {
      state.status = 'success'
      state.isLog = true
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
      state.bal= 0
      state.curr=""
      state.accounts=[]
      state.accountsStatus='loaded'
      state.recipient=""
      state.isLog=false
      state.paymentUrl=""
      state.isMultiCurrency = false
    },

    setUserAccounts(state:any, accounts:any) {
      state.accounts = accounts

      // Inform the UI if we are in a multi-currency display, note
      // we are testing the backend and not the currency symbol

      if (state.accounts.length > 1) {
        let currencyId = state.accounts[0].currencyId
        state.isMultiCurrency = state.accounts.slice(1).some(
          (account: any) => account.currencyId !== currencyId
        )
      }
    },

    setUserAccountsListStatus(state:any, status:string) {
      state.accountsStatus = status
    },
   
    setUserTransactions (state:any, transactions:any) {
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
    setBackends(state: any, backends: any) {
      state.backends = backends
    },
    setUserProfile(state: any, profile: object) {
      state.userProfile = profile
    }
  },
  getters: {
    getBal: (state: any) => {
      return function(): number {
        return state.bal
      }
    },
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
    }
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
