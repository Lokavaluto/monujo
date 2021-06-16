/* eslint-disable */
import { createStore } from 'vuex'

export default createStore({
  state: {
    bal:1200
  },
  mutations: {
    increment (state) {
      state.bal++
    }
  },
  actions: {
    increment (context) {
      context.commit('increment')
    }
  },
  modules: {
  }
})
