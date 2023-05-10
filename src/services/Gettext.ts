import { createGettext } from "vue3-gettext"

export class FailedLanguageLoading extends Error {
  lang: { label: string; id: string }
  constructor(message: any, lang: { label: string; id: string }) {
    super(message)
    this.name = "FailedLanguageLoading"
    this.lang = lang
  }
}

async function getDefaultLanguage(localesConfig: any, localesSettings: any) {
  const availableLanguages = localesConfig?.availableLanguages

  if (!availableLanguages) return false

  // any locale preferences ?

  const languageSetting = (await localesSettings.load())?.language
  if (languageSetting) {
    if (availableLanguages[languageSetting]) {
      return languageSetting
    }
  }

  // prefer navigator language ?

  if (localesConfig?.preferNavigatorLanguage) {
    let matchingLanguage = null
    const navigatorLanguages = navigator.languages
      ? navigator.languages
      : [navigator.language]

    for (const language of navigatorLanguages) {
      if (availableLanguages[language]) {
        matchingLanguage = language
        break
      }
    }
    if (matchingLanguage) {
      return matchingLanguage
    }
  }

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
    l = (l ||
      (await getDefaultLanguage(localesConfig, localesSettings))) as string
    if (!l) return
    if (l === this.current) return
    if (l !== localesConfig.appStringsLanguage && !this.translations[l]) {
      const { label, url } = localesConfig.availableLanguages[l]

      let response: any
      try {
        response = await fetch(url)
      } catch (err: any) {
        console.error(`Failed to load language file '${url}'.`, err)
        throw new FailedLanguageLoading(
          `Request for language file failed (fetch '${url}').`,
          { label, id: l }
        )
      }
      if (response.status !== 200) {
        throw new FailedLanguageLoading(
          `HTTPError ${response.status} while loading language file on '${url}'`,
          { label, id: l }
        )
      }
      let translations
      try {
        translations = JSON.parse(await response.text())
      } catch (error) {
        console.error(
          `File '${url}' was loaded, but doesn't contain valid json.`,
          error
        )
        throw new FailedLanguageLoading(
          `Failed to parse language file '${url}'.`,
          { label, id: l }
        )
      }
      this.translations = { ...this.translations, ...translations }
    }
    this.current = l
    return l
  }

  gettext.current = localesConfig.appStringsLanguage
  gettext.muted = [localesConfig.appStringsLanguage]

  gettext.FailedLanguageLoading = FailedLanguageLoading
  return gettext
}
