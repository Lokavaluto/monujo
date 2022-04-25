/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"

export default createStore({
  state: {
    showCredit: false,
    isModalOpen: false,
  },
  mutations: {
    setModalState(state: any, modalState: boolean) {
      state.isModalOpen = modalState
    },
  },
  actions: {},
  modules: {},
  getters: {},
})
