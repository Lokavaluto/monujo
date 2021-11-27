/* eslint-disable */

///<reference types="@types/node"/>

import router from "../router/index"
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
    recipient:"",
    isLog:false,
    paymentUrl: "",
    recipientHistory:[],
    // @TODO
    // Pull the available backends from the lokapi
    availableBackends: ['comchain', 'cyclos'],
    backendCredentials: {}
  },
  actions: {
    async login({ commit }: any, credentials: { login: string, password: string }) {
      let { login, password } = credentials
      commit('auth_request')
      try {
        await lokApiService.login(login, password)
      } catch (err:any) {
        // { APIRequestFailed, InvalidCredentials }
        commit('auth_error')
        throw err
      }
      commit("setThisWeekTransactions")
      commit('auth_success')
    },
    async resetTRS({commit} :any) {
      await commit("setThisWeekTransactions")
    },
    initAutoLogin({commit}:any) {
      commit("autoLogin")
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
    async getBackendCredentials({commit}:any) {
      try {
        // @TODO
        // Call this from the lokapi
        // let credentials = await lokapiService.getBackendCredentials()
        let credentials = {} 
        commit('set_backend_credentials', credentials)
      } catch (err:any) {
        console.error('Error getting backend credentials')
      }
    },
    async checkPasswordStrength({commit}:any, password:string) {
      // @TODO
      // Call this from the lokapi
      // return translatePwdFieldErrors(lokApiService.isStrongEnoughPassword(password))
      return translatePwdFieldErrors(isStrongEnoughPassword(password))
      // @TODO
      // Delete the isStrongEnoughPassword function when the real lokapi call is in place
      // (see at the bottom of this file)
    },
    async createAccount({commit}:any, { backend, password }:any) {
      console.log('store.createAccount(): sending data to backend', { backend, password })
    }
  },
  mutations: {
    async genPaymentLink(state: any, amount:number) {
      state.paymentUrl = await state.accounts[0].getCreditUrl(amount)
      // console.log("paymentUrl url =", state.paymentUrl.order_url)
    },
    auth_request(state: any) {
      state.status = 'loading'
    },
    auth_success(state: any) {
      state.status = 'success'
      state.userProfile = lokApiService.userProfile
    },
    auth_error(state: any) {
      state.status = 'error'
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
      state.recipient=""
      state.isLog=false
      state.paymentUrl=""
    },

    async setBalCurr(state:any) {
      let accounts: any;
      try {
        accounts = await lokApiService.getAccounts();
        let balance = await accounts[0].getBalance();
        let symbol = await accounts[0].getSymbol();
        state.bal = balance;
        state.curr = symbol;
        state.accounts = accounts
        
      } catch (err) {
        console.log('getAccounts failed', err);
      }
    },

    async autoLogin(state: any) {
      state.userProfile = lokApiService.getMyContact()
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
    set_backend_credentials(state:any, credentials:object) {
      state.backendCredentials = credentials
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

    getUserProfile: (state: any) => {
      return function(): any {
        return state.userProfile
      }
    },
    getApiToken: (state: any) => {
      return function(): any {
        return state.apiToken
      }
    },
    getTransactions: (state: any) => {
      return function(): any {
        return state.transactions
      }
    },
    getThisWeektransactions: (state: any) => {
      return function(): any {
        return state.thisWeektransactions
      }
    },
    hasUnconfiguredBackends: (state: any, getters: any) => {
      return function(): any {
        let unconfiguredBackends = getters.getUnconfiguredBackends()
        return unconfiguredBackends.length > 0
      }
    },
    getUnconfiguredBackends: (state: any) => {
      return function(): object {
        return state.availableBackends.filter((ab: string) => {
          return Object.keys(state.backendCredentials).indexOf(ab) === -1
        })
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

// @TODO
// Don't forget to delete this function when
// the lokapi call above will be effective
function isStrongEnoughPassword(pwd: string): string[] {
  let errors = new Array()
  /* at least 8 characters */
  if (! /.{8,}/.test(pwd) ) {
    errors.push('tooShort:8')
  }
  // /* bonus if longer */
  // if (! /.{12,}/.test(pwd)) {
  // }

  /* a lower letter */
  if (! /[a-z]/.test(pwd)) {
    errors.push('noLowerCase')
  }

  /* a upper letter */
  if (! /[A-Z]/.test(pwd)) {
    errors.push('noUpperCase')
  }

  /* a digit */
  if (! /\d/.test(pwd)) {
    errors.push('noDigit')
  }

  /* a special character */
  if (! /[^A-Za-z0-9]/.test(pwd)) {
    errors.push('noSymbol')
  }

  return errors
}
