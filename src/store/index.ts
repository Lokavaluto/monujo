/* eslint-disable */

///<reference types="@types/node"/>
///<reference types="lokapi"/>

import https from "https"

import { createStore } from 'vuex'
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



var lokAPI = new LokAPI(
  process.env.VUE_APP_LOKAPI_HOST,
  process.env.VUE_APP_LOKAPI_DB,
)


const moduleLokAPI = {
  // state: () => ({
  //   status: '',
  //   token: localStorage.getItem('lokapiToken') || '',
  // }),

  state: {
    status: '',
    apiToken: "",
    token: '',
    userProfile: null

  },
  actions: {
    async login({ commit }: any, credentials: { login: string, password: string }) {
      let { login, password } = credentials
      commit('auth_request')
      try {
        await lokAPI.login(login, password)
      } catch (err) { // {RequestFailed, APIRequestFailed, InvalidCredentials, InvalidJson}
        console.log('Login failed:', err.message)
        commit('auth_error')
        localStorage.removeItem('token')
        throw err
      }
      let accounts: any
      try {
        accounts = await lokAPI.getAccounts()
        console.log('getAccounts WORKED', accounts)
        console.log('internalId', accounts[0].internalId)
      } catch (err) {
        console.log('getAccounts failed', err)
      }
      console.log('amount:', accounts[0].balance)
      console.log('currency:', accounts[0].symbol)
      commit('auth_success', lokAPI.apiToken)
    },
    setTokenWithCookie({ commit }: any, cookie:string):void {
      console.log("cookie", cookie)
      commit("setToken", cookie)
    }
  },
  mutations: {
    auth_request(state: any) {
      state.status = 'loading'
    },
    auth_success(state: any, token: string) {
      state.status = 'success'
      state.token = token
      state.userProfile = lokAPI.userProfile
      state.apiToken = lokAPI.apiToken
    },
    auth_error(state: any) {
      state.status = 'error'
    },
    logout(state: any) {
      state.status = ''
      state.apiToken = ''
    },
    setToken(state: any, cookie: string) {
      state.apiToken = cookie
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

  }
}


export default createStore({
  state: {
    bal: 1200,
  },
  mutations: {
    increment(state) {
      state.bal++
    },
    superIncrement(state, i) {
      state.bal += i
    }
  },
  actions: {
    increment(context) {
      context.commit('increment')
    },
    superIncrement(context, i) {
      context.commit('superIncrement', i)
    }
  },
  modules: {
    lokapi: moduleLokAPI,
  }
})
