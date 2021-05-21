/* eslint-disable */
import { createStore } from 'vuex'

const moduleProfile = {
  state: () => ({
    bal: 1200
  }),
  mutations: {
    setNewBal (state:any, newBal:number) {
      state.bal = newBal
    }
  },
  getters: {
    balToEuros (state:any) {
      return state.bal * 2
    }
  }
}

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    profile:moduleProfile
  }
})
