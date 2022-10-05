/* eslint-disable */

///<reference types="@types/node"/>
import DatePicker from "vue-datepicker-next"

import { createStore } from "vuex"
import moment from "moment"

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

async function mkDatePicker(language: string, datePickerConfig: any) {
  function mkLocaleDatePickerConfig(
    localeName: string,
    localeDatePickerSettings: any
  ) {
    if (!localeDatePickerSettings.months) {
      const format = new Intl.DateTimeFormat(localeName, { month: "long" })
        .format
      localeDatePickerSettings.months = [...Array(12).keys()].map((m) =>
        format(new Date(Date.UTC(2021, m % 12, 5)))
      )
    }
    if (!localeDatePickerSettings.monthsShort) {
      const format = new Intl.DateTimeFormat(localeName, { month: "short" })
        .format
      localeDatePickerSettings.monthsShort = [...Array(12).keys()].map((m) =>
        format(new Date(Date.UTC(2021, m % 12, 5)))
      )
    }
    if (!localeDatePickerSettings.weekdays) {
      const format = new Intl.DateTimeFormat(localeName, { weekday: "long" })
        .format
      localeDatePickerSettings.weekdays = [...Array(7).keys()].map((d) =>
        format(new Date(Date.UTC(2021, 7, 1 + d)))
      )
    }
    if (!localeDatePickerSettings.weekdaysShort) {
      const format = new Intl.DateTimeFormat(localeName, { weekday: "short" })
        .format
      localeDatePickerSettings.weekdaysShort = [...Array(7).keys()].map((d) =>
        format(new Date(Date.UTC(2021, 7, 1 + d)))
      )
    }
    if (!localeDatePickerSettings.weekdaysMin) {
      const format = new Intl.DateTimeFormat(localeName, { weekday: "short" })
        .format
      localeDatePickerSettings.weekdaysMin = [...Array(7).keys()].map((d) =>
        format(new Date(Date.UTC(2021, 7, 1 + d))).substring(0, 2)
      )
    }
    if (!localeDatePickerSettings.firstDayOfWeek) {
      localeDatePickerSettings.firstDayOfWeek = 1
    }
    if (!localeDatePickerSettings.firstWeekContainsDate) {
      localeDatePickerSettings.firstWeekContainsDate = 1
    }
    return localeDatePickerSettings
  }

  const langConfig: any = {
    formatLocale: mkLocaleDatePickerConfig(
      language,
      datePickerConfig?.formatLocale || {}
    ),
    yearFormat: datePickerConfig?.yearFormat || "YYYY",
    monthFormat: datePickerConfig?.monthFormat || "MMM",
    monthBeforeYear:
      typeof datePickerConfig?.monthBeforeYear === "undefined"
        ? true
        : datePickerConfig.monthBeforeYear,
  }
  DatePicker.locale(language.split("-")[0], langConfig)
  return // XXXvlab: would be nice to use a local DatePicker
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
      datePicker: false,
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
        const availableLanguages = localesConfig.availableLanguages || {}
        const localeConfig = availableLanguages[datePickerLanguage]
        state.datePicker = mkDatePicker(
          datePickerLanguage,
          localeConfig?.datePickerFormat
        )
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
      },
    },
    modules: {},
    getters: {},
  })
  await store.dispatch("switchLocale")
  return store
}
