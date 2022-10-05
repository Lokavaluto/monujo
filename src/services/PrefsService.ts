const flatten = (arr: any) =>
  arr.reduce((flat: any, next: any) => flat.concat(next), [])

export default class PrefsService {
  private groups: any = {}
  private group_order: string[] = []
  private prefs: any[] = []
  private _getComponents: Array<{}> | null = null

  constructor() {}

  public register(...args: any[]): void {
    this.prefs.splice(0, 0, ...args)
  }

  public setGroup(name: string, label: string) {
    this.groups[name] = label
    this.group_order.push(name)
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

    const flattened = flatten(
      allPrefsPromises
        .filter((p: any) => p.status === "fulfilled")
        .map((x: any) => x.value)
    )
    const groups: any = {}
    for (const componentDef of flattened) {
      const groupName = componentDef.group
      if (!groups[groupName])
        groups[groupName] = {
          name: groupName,
          label: this.groups[groupName],
          componentDefs: [],
        }
      groups[groupName].componentDefs.push(componentDef)
    }
    return this.group_order.filter((g) => g in groups).map((g) => groups[g])
  }
}
