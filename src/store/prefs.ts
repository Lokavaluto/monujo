export function prefsStoreFactory(prefsService: any) {
  return {
    state: {
      componentDefs: [],
    },
    mutations: {
      setComponentDefs(state: any, componentDefs: any[]) {
        state.componentDefs = componentDefs
      },
    },
    actions: {
      async setupAfterLogin({ commit, dispatch }: any) {
        dispatch("fetchComponentDefs")
      },
      async fetchComponentDefs({ commit, state }: any) {
        let componentDefs: any[]
        try {
          componentDefs = await prefsService.getComponentDefs()
        } catch (err: any) {
          console.error("Error getting preference definitions", err)
          return
        }
        commit("setComponentDefs", componentDefs)
      },
    },
    modules: {},
    getters: {},
  }
}
