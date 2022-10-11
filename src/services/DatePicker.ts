import DatePicker from "vue-datepicker-next"

function mkLocaleDatePickerConfig(
  localeName: string,
  localeDatePickerSettings: any
) {
  if (!localeDatePickerSettings.months) {
    const format = new Intl.DateTimeFormat(localeName, { month: "long" }).format
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

;(DatePicker as any).setLocale = (
  language: string,
  datePickerConfig: any
): void => {
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
}

export default DatePicker as any
