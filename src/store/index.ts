/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"

export default createStore({
  state: {
    showCredit: false,
    isModalOpen: false,
    requestLoadingAfterCreds: false,
  },
  mutations: {
    setModalState(state: any, modalState: boolean) {
      state.isModalOpen = modalState
    },

    setRequestLoadingAfterCreds(state: any, requestLoadingAfterCreds: boolean) {
      state.requestLoadingAfterCreds = requestLoadingAfterCreds
    },
  },
  actions: {},
  modules: {},
  getters: {},
})
