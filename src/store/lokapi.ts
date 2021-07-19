/* eslint-disable */

///<reference types="@types/node"/>
///<reference types="lokapi"/>

import https from "https"

import { VueCookieNext } from 'vue-cookie-next'
import { LokAPIAbstract, e as LokAPIExc, t as LokAPIType } from "lokapi"


class cookieStore implements LokAPIType.IPersistentStore {
  constructor() {
    VueCookieNext.config({ expire: '7d' })
  }
  get(key: string, defaultValue?: string): string {
    return VueCookieNext.getCookie("lokapi_" + key)
  }
  set(key: string, value: string): void {
    VueCookieNext.setCookie("lokapi_" + key, value)
  }
  del(key: string): void {
    VueCookieNext.removeCookie("lokapi_" + key)
  }
}


class LokAPI extends LokAPIAbstract {
  httpRequest = (opts: LokAPIType.coreHttpOpts) => {
    if (opts.protocol !== 'https') {
      throw new Error(`Protocol ${opts.protocol} unsupported by this implementation`)
    }
    const httpsOpts = {
      host: opts.host,
      path: opts.path,
      method: opts.method,
      headers: opts.headers,
    }
    return new Promise((resolve, reject) => {

      let req = https.request(httpsOpts, (res) => {
        const { statusCode } = res

        let rawData = ''

        res.on('data', (chunk) => { rawData += chunk })
        res.on('end', () => {
          if (!statusCode || statusCode.toString().slice(0, 1) !== '2') {
            res.resume();
            reject(new LokAPIExc.HttpError(statusCode, res.statusMessage, rawData, res))
            return
          } else {
            resolve(rawData)
          }
        });
      })

      if (opts.data) req.write(JSON.stringify(opts.data))

      req.end();
      req.on('error', (err) => {
        console.error(`Encountered an error trying to make a request: ${err.message}`);
        reject(new LokAPIExc.RequestFailed(err.message))
      });
    })
  }
  base64Encode = (s: string) => Buffer.from(s).toString('base64')
  persistentStore = new cookieStore()
  requestLogin() {
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
    thisWeektransactions:null
  },
  actions: {
    async login({ commit }: any, credentials: { login: string, password: string }) {
      let { login, password } = credentials
      commit('auth_request')
      try {
        let partners = await lokAPI.searchRecipient("Al")
        console.log('getPartners WORKED', partners)
      } catch (err) {
        console.log('getAccounts failed', err)
      }
      try {
        await lokAPI.login(login, password)
      } catch (err) { // {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
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
    }


  },
  mutations: {
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
    },


    async autoLogin(state:any) {
      state.userProfile = lokAPI.getUserProfile(8)
    },
   
    async setThisWeekTransactions (state:any) {
      let transactions = await lokAPI.getTransactions()
      state.transactions = transactions 
      var maxTransactions = 5
      let trs = []
      for (let el of transactions) {
          if (el.jsonData.relatedUser) {
              trs.push(el)
              if (maxTransactions === 1) {
                  break;
              }
              maxTransactions -= 1
          }
      }
      console.log(trs)
      state.thisWeektransactions = trs
    }
  },
  getters: {
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

