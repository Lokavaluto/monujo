/* eslint-disable */

///<reference types="@types/node"/>
///<reference types="lokapi"/>

import { createStore } from 'vuex'
import { moduleLokAPI } from './lokapi'




export default createStore({
  state: {
    bal: 0,
    curr:"",
    accounts:[],
    recipient:""
  },
  mutations: {
    
  },
  actions: {
    
  },
  modules: {
    lokapi: moduleLokAPI,

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
  }
})
