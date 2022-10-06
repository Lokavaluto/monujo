/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"

const DEFAULT_NUMERIC_FORMAT_LANGUAGE = "fr-FR"
function mkNumericFormat(language: string) {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}


export default createStore({
  state: {
    showCredit: false,
    isModalOpen: false,
    numericFormatLanguage: DEFAULT_NUMERIC_FORMAT_LANGUAGE,
    numericFormat: mkNumericFormat(DEFAULT_NUMERIC_FORMAT_LANGUAGE),
    requestLoadingAfterCreds: false,
  },
  mutations: {
    setModalState(state: any, modalState: boolean) {
      state.isModalOpen = modalState
    },

    setRequestLoadingAfterCreds(state: any, requestLoadingAfterCreds: boolean) {
      state.requestLoadingAfterCreds = requestLoadingAfterCreds
    },

    setNumericFormatLanguage(state: any, numericFormatLanguage: string) {
      state.numericFormatLanguage = numericFormatLanguage
      state.numericFormat = mkNumericFormat(numericFormatLanguage)
    },
    },
  },
  actions: {},
  modules: {},
  getters: {},
})
