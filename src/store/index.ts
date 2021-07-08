/* eslint-disable */

///<reference types="@types/node"/>
///<reference types="lokapi"/>

import { createStore } from 'vuex'
import { moduleLokAPI } from './lokapi'


export default createStore({
  state: {
    bal: 0,
    curr:""
  },
  mutations: {
    
  },
  actions: {
    
  },
  modules: {
    lokapi: moduleLokAPI,
  }
})
