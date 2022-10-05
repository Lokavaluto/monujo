import { createGettext } from "vue3-gettext"

export default function mkGettext(
  localesConfig: any,
  localesSettings: any
): any {
  const gettext = createGettext({
    availableLanguages: {},
    defaultLanguage: "",
    translations: {},
  })

  return gettext
}
