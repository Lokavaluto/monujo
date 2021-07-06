/* eslint-disable */

///<reference types="@types/node"/>
///<reference types="lokapi"/>

import https from "https"

import { createStore } from 'vuex'
import { LokAPIAbstract, e as LokAPIExc, t as LokAPIType } from "lokapi"

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
            reject(new LokAPIExc.HttpError(statusCode, res.statusMessage, "", res))
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
  //   userData: null
  // }),

  state: {
    status: '',
    apiToken: "",
    token: '',
    userData: null,
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
      localStorage.setItem('lokapiToken', lokAPI.apiToken)
      console.log('lokAPI:', lokAPI)
      let accounts = await lokAPI.backends[0].accounts
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
      state.userData = lokAPI.userData
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
    setToken(state:any, cookie:string) {
      state.apiToken = cookie
    }
  },
  getters: {
    getUserData: (state: any) => {
      return function(): any {
        return state.userData
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
