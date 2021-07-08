/* eslint-disable */

///<reference types="@types/node"/>
///<reference types="lokapi"/>

import { createStore } from 'vuex'
import { moduleLokAPI } from './lokapi'


const moduleTransactionHandler = {
  state:{
    accounts:[],
    recipient:""
  },
  mutations: {

  },
  actions: {

  },
  getters: {
    getAccs: (state: any) => {
      return function(): Array<any> {
        return state.accounts
      }
    },
  }
}

export default createStore({
  state: {
    bal: 0,
    curr:"",
  },
  mutations: {
    
  },
  actions: {
    
  },
  modules: {
    lokapi: moduleLokAPI,
    transactionHandler: moduleTransactionHandler
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
  }
})
