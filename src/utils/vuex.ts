import { mapState } from "vuex"
export function mapModuleState(
  nesting: string[] | string,
  states: any[] = []
): any {
  if (!Array.isArray(nesting)) nesting = [nesting]

  const res: any = {}
  for (const stateName of states) {
    res[stateName] = (state: any) => {
      let obj = state
      for (const key of nesting) obj = obj[key]

      return obj[stateName]
    }
  }

  return mapState(res)
}
