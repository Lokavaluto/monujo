import { createGettext } from "vue3-gettext"

function getDefaultLanguage(localesConfig: any) {
  const availableLanguages = localesConfig?.availableLanguages

  if (!availableLanguages) return false

  // Do we have a preference in global config ?

  const defaultLanguage = localesConfig?.defaultLanguage
  if (defaultLanguage) {
    if (availableLanguages[defaultLanguage]) {
      return defaultLanguage
    }
  }

  return false
}

export default async function mkGettext(
  localesConfig: any,
  localesSettings: any
): Promise<any> {
  const availableLanguages = Object.fromEntries(
    Object.entries(localesConfig?.availableLanguages || {}).map(
      ([lang, langConfig]) => [lang, (<any>langConfig)?.label]
    )
  )

  const gettext = createGettext({
    availableLanguages,
    defaultLanguage: "",
    translations: {},
  }) as unknown as any

  gettext.loadTranslation = async function (l?: string) {
    l = (l || getDefaultLanguage(localesConfig)) as string
    if (!l) return
    if (l === this.current) return
    if (l !== localesConfig.appStringsLanguage && !this.translations[l]) {
      const url = localesConfig.availableLanguages[l].url
      let response: any
      try {
        response = await fetch(url)
      } catch (err) {
        console.log(`Failed to load language file '${url}'.`)
        throw err
      }
      let translations
      try {
        translations = JSON.parse(await response.text())
      } catch (error) {
        console.error(
          `File '${url}' was loaded, but doesn't contain valid json.`
        )
        throw error
      }
      this.translations = { ...this.translations, ...translations }
    }
    this.current = l
    return l
  }

  gettext.loadTranslation()

  return gettext
}
