/* eslint-disable */

///<reference types="@types/node"/>

import router from "../router/index"
import Swal from "sweetalert2"
import { lokApiService, getBankAccountName } from "../services/lokapiService"


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
    recipientHistory:[]
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
      state.accountsLoaded=false
      state.recipient=""
      state.isLog=false
      state.paymentUrl=""
    },

    async setBalCurr(state:any) {
      let accounts: any;
      try {
        accounts = await lokApiService.getAccounts();
        if (accounts.length > 0) {
          // Compute a global moneyAccount balance
          Promise.allSettled(
            accounts.map((a:any) => a.getBalance())
          ).then((balances:any) => {
            state.bal = balances.reduce(
              (s:number, b:any) => s + parseFloat(b.value), 0
            )
          })
          // See if all accounts have same currency ?
          Promise.allSettled(
            accounts.map((a:any) => a.getSymbol())
          )
          state.curr = await accounts.reduce((c:string, a:any) => {
            let s = a.value
            if (s !== c) {
              return 'mixed currencies'
            }
            return s
          }, '');
        }
        const sortOrder = (a: any, b: any) => `${a.backend}${a.name}` < `${b.backend}${b.name}` ? -1 : 1
        Promise.allSettled(
          Object.values(accounts).map(
            (account: any) => Promise.allSettled([
              getBankAccountName(account),
              account.getBalance(),
              account.getSymbol(),
            ]).then(vals => {
              const [name, bal, curr] = vals.map(a => (<any>a).value)
              const accountData = {
                name, bal, curr,
                backend: account.internalId.split(':')[0],
                id: account.internalId,
              }
              let idx = state.accounts.findIndex((a: any) => account.id === a.id)
              let replace
              if (idx === -1) {
                replace = 0
                idx = 0
                while (
                  idx < state.accounts.length &&
                    sortOrder(accountData, state.accounts[idx]) > 0
                ) idx++
              } else {
                replace = 1
              }
              state.accounts.splice(idx, 0, accountData)
            })
          )).then(() => {  // Only when state.accounts if filled

            // It'll detect and find multiple account names, and if
            // this is the case, will provide an additional 'backend'
            // field in all the state.accounts[i] concerned.

            var accountNames: {[k: string]: Array<any>} = {}
            state.accounts.forEach((a: any) => {
              if (!accountNames[a.name]) {
                accountNames[a.name] = []
              }
              accountNames[a.name].push(a)
            })

            Object.entries(accountNames).filter(
              ([n, as]) => as.length > 1
            ).forEach(([n, as]) => {
              for (const a of as) {
                const account = accounts.find((l: any) => l.internalId === a.id)
                a.backend = account.internalId  // full backend information
              }
            })
            state.accountsLoaded = true
          })
      } catch (err) {
        console.error('getAccounts failed', err);
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

