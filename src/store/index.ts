/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"
import moment from "moment"

import DatePicker from "../services/DatePicker"

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

export default async function mkStore(localesConfig: any, gettext: any) {
  const store = createStore({
    state: {
      showCredit: false,
      isModalOpen: false,
      numericFormatLanguage: false,
      numericFormat: false,
      dateFormatLanguage: false,
      dateFormat: false,
      relativeDateFormat: false,
      datePickerLanguage: false,
      requestLoadingAfterCreds: false,
    },
    mutations: {
      setModalState(state: any, modalState: boolean) {
        state.isModalOpen = modalState
      },

      setRequestLoadingAfterCreds(
        state: any,
        requestLoadingAfterCreds: boolean
      ) {
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
      },
    },
    actions: {
      async switchLocale({ commit }: any, localeIdentifier) {
        const availableLanguages = localesConfig?.availableLanguages || {}

        // If localeIdentifier is null, gettext will resolve the name
        // of the default language. It can still return "false"
        localeIdentifier = await gettext.loadTranslation(localeIdentifier)
        const localeConfig = availableLanguages[localeIdentifier] || {}
        localeIdentifier = localeIdentifier || "en-US"
        commit(
          "setNumericFormatLanguage",
          localeConfig?.numericFormat || localeIdentifier
        )
        commit(
          "setDateFormatLanguage",
          localeConfig?.dateFormat || localeIdentifier
        )
        commit("setDatePickerLanguage", localeIdentifier)
        DatePicker.setLocale(localeIdentifier, localeConfig?.datePickerFormat)
      },
    },
    modules: {},
    getters: {},
  })
  await store.dispatch("switchLocale")
  return store
}
