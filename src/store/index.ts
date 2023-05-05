/* eslint-disable */

///<reference types="@types/node"/>

import { createStore } from "vuex"
import moment from "moment"

import DatePicker from "../services/DatePicker"
import { UIError } from "../exception"

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
  const { $gettext } = gettext
  const store = createStore({
    state: {
      showCredit: false,
      numericFormatLanguage: false,
      dateFormatLanguage: false,
      datePickerLanguage: false,
      requestLoadingAfterCreds: false,
    },
    mutations: {
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
        try {
          localeIdentifier = await gettext.loadTranslation(localeIdentifier)
        } catch (err: any) {
          if (!(err instanceof gettext.FailedLanguageLoading)) {
            throw err
          }
          throw new UIError(
            $gettext('Failed to load language "%{ lang }"', {
              lang: err.lang.label,
            }),
            err
          )
          return
        }

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
  return store
}
