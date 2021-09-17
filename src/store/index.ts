/* eslint-disable */

///<reference types="@types/node"/>
///<reference types="lokapi"/>

import { createStore } from 'vuex'
import { moduleLokAPI } from './lokapi'


export default createStore({
  state: {
    operationSelector:0,
    showCredit:false
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    lokapi: moduleLokAPI,
  },
  getters: {
  }
})
