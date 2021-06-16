/* eslint-disable */
import { createStore } from 'vuex'

export default createStore({
  state: {
    bal:1200
  },
  mutations: {
    increment (state) {
      state.bal++
    },
    superIncrement(state, i) {
      state.bal += i
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    },
    superIncrement (context, i) {
      context.commit('superIncrement', i)
    }
  },
  modules: {
  }
})
