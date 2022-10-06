/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"
import moment from "moment"

const DEFAULT_NUMERIC_FORMAT_LANGUAGE = "fr-FR"
const DEFAULT_DATE_FORMAT_LANGUAGE = "fr-FR"

function mkNumericFormat(language: string) {
  return new Intl.NumberFormat(language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function mkDateFormat(language: string) {
  return new Intl.DateTimeFormat(language, {
    weekday: "long",
    day: "numeric",
    month: "numeric",
  })
}

function mkRelativeDateFormat(language: string) {
  moment.locale(language)
  return {
    format(date: string): string {
      return moment(date).fromNow()
    },
  }
}

export default createStore({
  state: {
    showCredit: false,
    isModalOpen: false,
    numericFormatLanguage: DEFAULT_NUMERIC_FORMAT_LANGUAGE,
    numericFormat: mkNumericFormat(DEFAULT_NUMERIC_FORMAT_LANGUAGE),
    dateFormatLanguage: DEFAULT_DATE_FORMAT_LANGUAGE,
    dateFormat: mkDateFormat(DEFAULT_DATE_FORMAT_LANGUAGE),
    relativeDateFormat: mkRelativeDateFormat(DEFAULT_DATE_FORMAT_LANGUAGE),
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

    setDateFormatLanguage(state: any, dateFormatLanguage: string) {
      state.dateFormatLanguage = dateFormatLanguage
      state.dateFormat = mkDateFormat(dateFormatLanguage)
      state.relativeDateFormat = mkRelativeDateFormat(dateFormatLanguage)
    },
  },
  actions: {},
  modules: {},
  getters: {},
})
