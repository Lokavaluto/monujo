import { createApp } from "vue"
import Loading from "vue-loading-overlay"
import "vue-loading-overlay/dist/css/index.css"
import "@/utils/showSpinner.scss"

// Patch vue-loading-overlay to accept string sizes (e.g., "2em", "75px")
const sizeType = [Number, String]
Loading.props.width = sizeType
Loading.props.height = sizeType
if (Loading.components?.Spinner) {
  Loading.components.Spinner.props.width = { type: sizeType, default: 64 }
  Loading.components.Spinner.props.height = { type: sizeType, default: 64 }
}

export function replaceWithLoader(
  this: any,
  selector: string,
  size: string = "75px",
  strokeWidth: Number = 2,
  replace: boolean = false
) {
  let element: HTMLElement | null = null
  if (this && this.$el && this.$el instanceof HTMLElement) {
    element = this.$el?.querySelector(selector)
    if (!element) element = document.querySelector(selector)
  } else {
    element = document.querySelector(selector)
  }
  if (!element) {
    console.error(`Element ${selector} not found.`)
    return null
  }
  const loadingElement = document.createElement("div")
  loadingElement.setAttribute("id", "loader")

  element.prepend(loadingElement)
  const loadingApp = createApp(Loading, {
    active: true,
    isFullPage: false,
    width: size,
    height: size,
    strokeWidth,
  })

  if (replace) {
    element.style.visibility = "hidden"
    loadingElement.style.visibility = "visible"
    const origRemove = loadingElement.remove
    loadingElement.remove = function () {
      if (element instanceof HTMLElement) {
        element.style.visibility = "visible"
      }
      origRemove.call(this)
    }
  }

  loadingApp.mount(loadingElement)
  return loadingElement
}

export function showSpinnerMethod(
  selector: string | ((this: any, state: boolean, ...args: any[]) => void)
) {
  return function <T extends (this: any, ...args: any[]) => Promise<any>>(
    fn: T
  ): T {
    return async function (
      this: any,
      ...args: Parameters<T>
    ): Promise<ReturnType<T>> {
      let loadingElement: any
      if (typeof selector === "string") {
        loadingElement = replaceWithLoader.apply(this, [selector, "75px"])
      } else {
        loadingElement = selector.apply(this, [true, ...args])
      }
      try {
        const result = await fn.apply(this, args)
        return result
      } catch (error: any) {
        console.log(error)
        throw error
      } finally {
        if (loadingElement) {
          loadingElement.remove()
        } else {
          if (typeof selector !== "string") {
            selector.apply(this, [false, ...args])
          }
        }
      }
    } as unknown as T
  }
}

export function showLoadingClassMethod(
  selector: string,
  className: string,
  condition?: (this: any) => boolean
) {
  return function <T extends (this: any, ...args: any[]) => Promise<any>>(
    fn: T
  ): T {
    return async function (
      this: any,
      ...args: Parameters<T>
    ): Promise<ReturnType<T>> {
      const shouldApply = !condition || condition.call(this)
      let element: HTMLElement | null = null
      if (shouldApply) {
        if (this && this.$el && this.$el instanceof HTMLElement) {
          element = this.$el?.querySelector(selector)
          if (!element) element = document.querySelector(selector)
        } else {
          element = document.querySelector(selector)
        }
        if (element) element.classList.add(className)
      }
      try {
        return await fn.apply(this, args)
      } finally {
        if (element) element.classList.remove(className)
      }
    } as unknown as T
  }
}

// XXXvlab: use any[]
export function showSpinner(selector: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    return showSpinnerMethod(selector)(descriptor.value)
  }
}
