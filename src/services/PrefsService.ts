const flatten = (arr: any) =>
  arr.reduce((flat: any, next: any) => flat.concat(next), [])

export default class PrefsService {
  private prefs: any[] = []
  private _getComponents: Array<{}> | null = null

  constructor() {}

  public register(...args: any[]): void {
    this.prefs.splice(0, 0, ...args)
  }

  public async getComponentDefs() {
    const allPrefsPromises = (await Promise.allSettled(
      this.prefs.map(async (componentDefinition) => {
        if (typeof componentDefinition === "function") {
          return await componentDefinition()
        }
        return componentDefinition
      })
    )) as any

    return flatten(
      allPrefsPromises
        .filter((p: any) => p.status === "fulfilled")
        .map((x: any) => x.value)
    )
  }
}
