/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"
import moment from "moment"

import DatePicker from "../services/DatePicker"

// XXXvlab: required to make vuex getters cached in vue 3 (as they
// should be).  (cf: https://vuex.vuejs.org/guide/getters.html#getters
// ) this is temporary as cached getters were promised and/or we might
// want to move to pinia anytime soon.
function PoorMansCachedGetter(getter: any, stateAttrName: string) {
  let cacheStore: any = {}
  return (state: any) => {
    let arg = state[stateAttrName]
    if (!(arg in cacheStore)) {
      cacheStore[arg] = getter(state)
    }
    return cacheStore[arg]
  }
}

export default async function mkStore(localesConfig: any, gettext: any) {
  const store = createStore({
    state: {
      showCredit: false,
      isModalOpen: false,
      numericFormatLanguage: false,
      dateFormatLanguage: false,
      datePickerLanguage: false,
      requestLoadingAfterCreds: false,
      modalStack: [Object],
    },
    mutations: {
      setModalState(state: any, modalState: boolean) {
        state.isModalOpen = modalState
      },

      setModalStack(
        state: any,
        modal: { type: number; component: string; step: number }
      ) {
        const { type, component, step } = modal
        if (type == 1) {
          state.modalStack.push({ component, step })
        } else {
          state.modalStack.splice(state.modalStack.length - 1, 1)
        }
      },
      setRequestLoadingAfterCreds(
        state: any,
        requestLoadingAfterCreds: boolean
      ) {
        state.requestLoadingAfterCreds = requestLoadingAfterCreds
      },

      setNumericFormatLanguage(state: any, numericFormatLanguage: string) {
        state.numericFormatLanguage = numericFormatLanguage
      },

      setDateFormatLanguage(state: any, dateFormatLanguage: string) {
        state.dateFormatLanguage = dateFormatLanguage
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
        // DatePicker locale is unfortunately global
        DatePicker.setLocale(localeIdentifier, localeConfig?.datePickerFormat)
      },
    },
    modules: {},
    getters: {
      getModalState: (state) => {
        return state.isModalOpen
      },
      getModalStack: (state) => {
        return state.modalStack
      },
      getCurrentModal: (state) => {
        return state.modalStack[state.modalStack.length - 1] || false
      },
      numericFormat: PoorMansCachedGetter(
        (state: any) =>
          new Intl.NumberFormat(state.numericFormatLanguage, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format,
        "numericFormatLanguage"
      ),
      dateFormat: PoorMansCachedGetter(
        (state: any) =>
          new Intl.DateTimeFormat(state.dateFormatLanguage, {
            weekday: "long",
            day: "numeric",
            month: "numeric",
          }).format,
        "dateFormatLanguage"
      ),
      relativeDateFormat: PoorMansCachedGetter((state: any) => {
        moment.locale(state.dateFormatLanguage)
        return (date: string): string => {
          return moment(date).fromNow()
        }
      }, "dateFormatLanguage"),
    },
  })
  await store.dispatch("switchLocale")
  return store
}
