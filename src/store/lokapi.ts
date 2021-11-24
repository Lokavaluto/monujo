/* eslint-disable */

///<reference types="@types/node"/>

import router from "../router/index"

import LokAPIBrowserAbstract from '@lokavaluto/lokapi-browser'

import comchain from '@lokavaluto/lokapi-backend-comchain'
import cyclos from '@lokavaluto/lokapi-backend-cyclos'

import Swal from "sweetalert2"


class LokAPI extends LokAPIBrowserAbstract {

  BackendFactories = {
    comchain,
    cyclos
  }

  requestLocalPassword = async function (state: string) {
    let text
    if (state === 'firstTry') {
      text = ''  // XXXvlab: need i16n
    } else if (state === 'failedUnlock') {
      text = 'Échec du déchiffrage. ' +
        'Le mot de passe était probablement incorrect. '+
        'Ré-essayez une nouvelle fois'  // XXXvlab: need i16n
    }
    const ret = await Swal.fire({
      title: 'Entrez votre mot de passe',  // XXXvlab: need i16n
      text,
      showCloseButton: true,
      input: 'password',
      inputLabel: 'Mot de passe du portefeuille',  // XXXvlab: need i16n
      inputPlaceholder: 'Votre mot de passe',  // XXXvlab: need i16n
      inputAttributes: {
        maxlength: '32',
        autocapitalize: 'off',
        autocorrect: 'off'
      }
    })
    if (ret.isConfirmed) {
      return ret.value
    }
    throw new Error('User canceled the dialog box')
  }

  requestLogin() {
    router.push("/")
    console.log("Login requested !")
  }

}


if (!process.env.VUE_APP_LOKAPI_HOST) {
  throw new Error("Please specify VUE_APP_LOKAPI_HOST in '.env'")
}


if (!process.env.VUE_APP_LOKAPI_DB) {
  throw new Error("Please specify VUE_APP_LOKAPI_DB in '.env'")
}



export var lokAPI = new LokAPI(
  process.env.VUE_APP_LOKAPI_HOST,
  process.env.VUE_APP_LOKAPI_DB,
)


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
    recipientHistory:[]
  },
  actions: {
    async login({ commit }: any, credentials: { login: string, password: string }) {
      let { login, password } = credentials
      commit('auth_request')
      let partners: any
      try {
        partners = await lokAPI.searchRecipients("Al")
        console.log('searchRecipients WORKED', partners)
      } catch (err) {
        console.log('searchRecipients failed', err)
      }
      try {
        await lokAPI.login(login, password)
      } catch (err:any) { // {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
        console.log('Login failed:', err.message)
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
      state.userProfile = lokAPI.userProfile
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
        accounts = await lokAPI.getAccounts();
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
      state.userProfile = lokAPI.getMyContact()
    },
   
    async setThisWeekTransactions (state:any) {
      let transactionsGen = lokAPI.getTransactions()

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
    }
  }
}

