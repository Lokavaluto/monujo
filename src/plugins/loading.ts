import { useLoading } from "vue-loading-overlay/src/js/api"
import Component from "vue-loading-overlay/src/js/Component.vue"

class Wrapper {
  private loadingInstance: any
  private _instance: null | any = null

  constructor(loadingInstance: any) {
    this.loadingInstance = loadingInstance
  }

  show() {
    if (!this._instance) {
      this._instance = this.loadingInstance.show()
    }
  }

  hide() {
    if (this._instance) {
      this._instance.hide()
      this._instance = null
    }
  }
}

Component.install = (app: any, props = {}, slots = {}) => {
  const loadingInstance = useLoading(props, slots)
  const wrapper = new Wrapper(loadingInstance)
  app.config.globalProperties.$loading = wrapper
}

// XXXvlab: didn't find a better way to make typescript
// happy here
export default <{ install: any }>(<unknown>Component)
