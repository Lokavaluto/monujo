/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"
import moment from "moment"

const DEFAULT_NUMERIC_FORMAT_LANGUAGE = "en-US"
const DEFAULT_DATE_FORMAT_LANGUAGE = "en-US"
const DEFAULT_DATE_PICKER_LANGUAGE = "en"

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

function mkDatePicker(language: string) {
  let lang = import(`vue-datepicker-next/locale/${language}.es`)
  return // XXXvlab: would be nice to use a local DatePicker
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
    datePickerLanguage: DEFAULT_DATE_PICKER_LANGUAGE,
    datePicker: mkDatePicker(DEFAULT_DATE_PICKER_LANGUAGE),
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

    setDatePickerLanguage(state: any, datePickerLanguage: string) {
      state.datePickerLanguage = datePickerLanguage
      state.datePicker = mkDatePicker(datePickerLanguage)
    },
  },
  actions: {},
  modules: {},
  getters: {},
})
