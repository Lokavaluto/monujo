/* eslint-disable */
declare module "@meforma/vue-toaster"
declare module "vue-loading-overlay"
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<{}, {}, any>
  export default component
}
