import { beforeEach, afterEach, describe, expect, it, vi } from "vitest"
import { flushPromises, mount, VueWrapper } from "@vue/test-utils"
import Signup from "@/views/Signup.vue"
import Login from "@/views/Login.vue"
import { takeSurveyReturn } from "@/utils/surveyReturn"
import { createRouter, createMemoryHistory } from "vue-router"

vi.mock("@lokavaluto/lokapi-browser", () => ({ RestExc: {} }))

const wrappers: VueWrapper[] = []
const signUpUrl = "http://odoo.test:8069/custom-registration?language=fr#start"
const messageType = "odoo:survey:return"
const domSettings = (window as any).happyDOM.settings
const originalIframeLoading = domSettings.disableIframePageLoading

beforeEach(() => {
  // Happy DOM cannot load the cross-origin Odoo frame. Give each iframe its
  // own window identity while keeping unit tests independent of the network.
  domSettings.disableIframePageLoading = true
  const frameWindows = new WeakMap<HTMLIFrameElement, Window>()
  vi.spyOn(
    HTMLIFrameElement.prototype,
    "contentWindow",
    "get"
  ).mockImplementation(function (this: HTMLIFrameElement) {
    if (!frameWindows.has(this)) frameWindows.set(this, {} as Window)
    return frameWindows.get(this)!
  })
})

function render(component: any, config: Record<string, unknown> = {}) {
  const router = { replace: vi.fn(), push: vi.fn() }
  const lokapi = {
    canSignup: vi.fn().mockResolvedValue(false),
    canResetPassword: vi.fn().mockResolvedValue(false),
    signup: vi.fn(),
  }
  const wrapper = mount(component, {
    attachTo: document.body,
    global: {
      mocks: {
        $config: { lokapiHost: "http://odoo.test:8069", ...config },
        $gettext: (s: string) => s,
        $router: router,
        $route: { path: "/", query: {}, hash: "" },
        $lokapi: lokapi,
        $persistentStore: { get: () => undefined },
        $localSettings: { load: async () => ({}) },
      },
      stubs: { "router-view": true, PasswordField: true },
    },
  })
  wrappers.push(wrapper)
  return { wrapper, router, lokapi }
}

function send(
  source: Window | null,
  origin = "http://odoo.test:8069",
  data: unknown = { type: messageType }
) {
  window.dispatchEvent(new MessageEvent("message", { origin, source, data }))
}

afterEach(() => {
  wrappers.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ""
  takeSurveyReturn()
  vi.restoreAllMocks()
  domSettings.disableIframePageLoading = originalIframeLoading
})

describe("membership registration", () => {
  it("embeds the configured URL and preserves its query and fragment", async () => {
    const { wrapper, router, lokapi } = render(Signup, {
      signUpUrl,
    })
    await flushPromises()
    const iframe = wrapper.get("iframe")
    const url = new URL(iframe.attributes("src")!)
    expect(url.origin).toBe("http://odoo.test:8069")
    expect(url.pathname).toBe("/custom-registration")
    expect(url.searchParams.get("language")).toBe("fr")
    expect(url.hash).toBe("#start")
    expect(url.searchParams.has("return_mode")).toBe(false)
    expect(url.searchParams.get("parent_origin")).toBe(window.location.origin)
    expect(url.searchParams.has("return_url")).toBe(false)
    expect(url.searchParams.get("return_label")).toBe("Back to login")
    expect(wrapper.find("form").exists()).toBe(false)
    await iframe.trigger("load")
    expect(router.replace).not.toHaveBeenCalled()
    expect(lokapi.signup).not.toHaveBeenCalled()
  })

  it("uses the membership URL origin independently of lokapiHost", async () => {
    const { wrapper, router } = render(Signup, {
      signUpUrl: "https://membership.test/join",
    })
    await flushPromises()
    const iframe = wrapper.get("iframe")
    expect(new URL(iframe.attributes("src")!).origin).toBe("https://membership.test")
    const source = (iframe.element as HTMLIFrameElement).contentWindow
    send(source)
    expect(router.replace).not.toHaveBeenCalled()
    send(source, "https://membership.test")
    expect(router.replace).toHaveBeenCalledWith({ name: "Login" })
  })

  it.each([
    ["http://odoo.test:8069", "http://odoo.test:8069"],
    ["odoo.test", "https://odoo.test"],
  ])("resolves a relative membership URL against lokapiHost %s", async (host, origin) => {
    const { wrapper } = render(Signup, {
      lokapiHost: host,
      signUpUrl: "/membership?language=en",
    })
    await flushPromises()
    const url = new URL(wrapper.get("iframe").attributes("src")!)
    expect(url.origin).toBe(origin)
    expect(url.pathname).toBe("/membership")
    expect(url.searchParams.get("language")).toBe("en")
    expect(url.searchParams.has("return_mode")).toBe(false)
    expect(url.searchParams.get("parent_origin")).toBe(window.location.origin)
    expect(url.searchParams.has("return_url")).toBe(false)
    expect(url.searchParams.get("return_label")).toBe("Back to login")
  })

  it.each(["", undefined])("shows the regular form when signUpUrl is %s", (url) => {
    const { wrapper } = render(Signup, {
      signUpUrl: url,
    })
    expect(wrapper.find("iframe").exists()).toBe(false)
    expect(wrapper.find("#email").exists()).toBe(true)
    expect(wrapper.find("#first-name").exists()).toBe(true)
    expect(wrapper.find("#last-name").exists()).toBe(true)
    expect(
      wrapper.get('button[type="submit"]').attributes("disabled")
    ).toBeDefined()
  })

  it("accepts only the return message from the current Odoo frame", async () => {
    const { wrapper, router } = render(Signup, { signUpUrl })
    await flushPromises()
    const source = (wrapper.get("iframe").element as HTMLIFrameElement)
      .contentWindow
    expect(source).not.toBeNull()
    send(source, "https://unexpected.test")
    send(window)
    send(null)
    send(source, undefined, null)
    send(source, undefined, "not a return message")
    send(source, undefined, { type: "membership:complete" })
    expect(router.replace).not.toHaveBeenCalled()
    send(source)
    expect(router.replace).toHaveBeenCalledOnce()
    expect(router.replace).toHaveBeenCalledWith({ name: "Login" })
  })

  it("passes only a valid email from the trusted survey frame to login", async () => {
    const { wrapper, router } = render(Signup, { signUpUrl })
    await flushPromises()
    const source = (wrapper.get("iframe").element as HTMLIFrameElement).contentWindow
    send(source, undefined, {
      type: messageType,
      payload: { email: "alice+survey@example.org", password: "ignored" },
    })
    expect(router.replace).toHaveBeenLastCalledWith({ name: "Login" })
    expect(takeSurveyReturn()).toEqual({ email: "alice+survey@example.org" })
    // Ignore repeated messages while navigation is pending.
    send(source, undefined, { type: messageType, payload: { email: "other@example.org" } })
    expect(router.replace).toHaveBeenCalledOnce()
    expect(takeSurveyReturn()).toBeUndefined()
  })

  it("removes the listener when leaving and uses only the new frame on reopening", async () => {
    const first = render(Signup, { signUpUrl })
    await flushPromises()
    const oldSource = (first.wrapper.get("iframe").element as HTMLIFrameElement)
      .contentWindow
    const remove = vi.spyOn(window, "removeEventListener")
    first.wrapper.unmount()
    wrappers.splice(wrappers.indexOf(first.wrapper), 1)
    expect(remove).toHaveBeenCalledWith("message", expect.any(Function))
    send(oldSource)
    expect(first.router.replace).not.toHaveBeenCalled()

    const second = render(Signup, { signUpUrl })
    await flushPromises()
    send(oldSource)
    expect(second.router.replace).not.toHaveBeenCalled()
    send(
      (second.wrapper.get("iframe").element as HTMLIFrameElement).contentWindow
    )
    expect(second.router.replace).toHaveBeenCalledOnce()
    expect(second.router.replace).toHaveBeenCalledWith({ name: "Login" })
    expect(first.router.replace).not.toHaveBeenCalled()
  })

  it.each([undefined, "not a valid host"])("accepts an absolute URL without a usable lokapiHost: %s", async host => {
    const { wrapper } = render(Signup, { signUpUrl, lokapiHost: host })
    await flushPromises()
    expect(new URL(wrapper.get("iframe").attributes("src")!).origin).toBe("http://odoo.test:8069")
  })

  it.each([
    "javascript:alert(1)", "data:text/html,hello", "file:///tmp/form.html",
    "https://user:password@membership.test/join", "https://[", 42,
  ])("shows an error and no iframe for invalid URL %j", async url => {
    const { wrapper, router } = render(Signup, { signUpUrl: url })
    await flushPromises()
    expect(wrapper.find("iframe").exists()).toBe(false)
    expect(wrapper.get('[role="alert"]').text()).toContain("Unable to open")
    expect(wrapper.find("button").exists()).toBe(false)
    expect(router.replace).not.toHaveBeenCalled()
  })

  it("rejects a relative URL without a usable host", async () => {
    const { wrapper } = render(Signup, { signUpUrl: "/join", lokapiHost: undefined })
    await flushPromises()
    expect(wrapper.find("iframe").exists()).toBe(false)
    expect(wrapper.find('[role="alert"]').exists()).toBe(true)
  })

  it("shows no Monujo return button before the survey sends its completion message", async () => {
    const { wrapper, router } = render(Signup, { signUpUrl })
    await flushPromises()
    expect(wrapper.find("button").exists()).toBe(false)
    expect(router.replace).not.toHaveBeenCalled()
  })

  it("clears pending data and allows retry if navigation fails", async () => {
    const { wrapper, router } = render(Signup, { signUpUrl })
    await flushPromises()
    const source = (wrapper.get("iframe").element as HTMLIFrameElement).contentWindow
    router.replace.mockRejectedValueOnce(new Error("navigation failed"))
    send(source)
    await flushPromises()
    expect(takeSurveyReturn()).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toContain("Unable to return")
    send(source)
    await flushPromises()
    expect(router.replace).toHaveBeenCalledTimes(2)
  })

  it("does not keep an email when navigation completes without mounting Login", async () => {
    const { wrapper } = render(Signup, { signUpUrl })
    await flushPromises()
    const source = (wrapper.get("iframe").element as HTMLIFrameElement).contentWindow
    send(source, undefined, { type: messageType, payload: { email: "alice@example.org" } })
    await flushPromises()
    expect(takeSurveyReturn()).toBeUndefined()
  })

  it("delivers a return to the real Login route without placing email in the URL", async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/signup", name: "Signup", component: Signup },
        { path: "/", name: "Login", component: Login },
      ],
    })
    await router.push({ name: "Signup" })
    const challenge = vi.fn()
    const wrapper = mount({ template: "<router-view />" }, {
      attachTo: document.body,
      global: {
        plugins: [router],
        mocks: {
          $config: { signUpUrl, lokapiHost: "http://odoo.test:8069" },
          $gettext: (s: string) => s,
          $lokapi: { canResetPassword: async () => false },
          $persistentStore: { get: () => "previous@example.org" },
          $localSettings: { load: async () => ({ biometryEnabled: true }) },
          $biometry: { hasCredentialsAvailable: async () => true, challenge },
        },
        stubs: { PasswordField: true },
      },
    })
    wrappers.push(wrapper)
    await flushPromises()
    const source = (wrapper.get("iframe").element as HTMLIFrameElement).contentWindow
    send(source, undefined, { type: messageType, payload: { email: "alice@example.org" } })
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe("/")
    expect((wrapper.get('input[name="login"]').element as HTMLInputElement).value).toBe("alice@example.org")
    expect(challenge).not.toHaveBeenCalled()
    expect(takeSurveyReturn()).toBeUndefined()
  })

  it.each([signUpUrl, "https://legacy.test/signup"])("opens signup inside Monujo for signUpUrl %s", async (url) => {
    const open = vi.spyOn(window, "open").mockReturnValue(null)
    const { wrapper, router, lokapi } = render(Login, {
      signUpUrl: url,
    })
    await flushPromises()
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Not a member yet ?")!
      .trigger("click")
    expect(router.push).toHaveBeenCalledWith({ name: "Signup" })
    expect(open).not.toHaveBeenCalled()
    expect(lokapi.canSignup).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain("Become a member")
  })

  it.each(["", undefined])("uses backend signup permission when signUpUrl is %s", async (url) => {
    const open = vi.spyOn(window, "open").mockReturnValue(null)
    const { wrapper, router, lokapi } = render(Login, {
      signUpUrl: url,
    })
    await flushPromises()
    expect(lokapi.canSignup).toHaveBeenCalledOnce()
    expect(wrapper.text()).not.toContain("Not a member yet ?")
    expect(open).not.toHaveBeenCalled()
    expect(router.push).not.toHaveBeenCalled()

    // Only the backend's signup permission enables the regular form.
    lokapi.canSignup.mockResolvedValue(true)
    await (wrapper.vm as any).getCanSignup()
    await flushPromises()
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Not a member yet ?")!
      .trigger("click")
    expect(router.push).toHaveBeenCalledWith({ name: "Signup" })
    expect(open).not.toHaveBeenCalled()
  })

  it("opens regular signup when Odoo allows it and no URL is configured", async () => {
    const { wrapper, router, lokapi } = render(Login)
    lokapi.canSignup.mockResolvedValue(true)
    await (wrapper.vm as any).getCanSignup()
    await flushPromises()
    await wrapper
      .findAll("button")
      .find((button) => button.text() === "Not a member yet ?")!
      .trigger("click")
    expect(router.push).toHaveBeenCalledWith({ name: "Signup" })
  })

  it("hides signup when Odoo disallows it and no URL is configured", async () => {
    const { wrapper, lokapi } = render(Login)
    await flushPromises()
    expect(wrapper.text()).not.toContain("Not a member yet ?")
    expect(lokapi.canSignup).toHaveBeenCalledOnce()
  })

  it.each([
    { signUpUrl },
    { signUpUrl: "https://legacy.test/signup" },
    { signUpUrl: "" },
    {},
  ])("honors hideAccountCreate with config %j", async (urls) => {
    const { wrapper, lokapi } = render(Login, {
      hideAccountCreate: true,
      ...urls,
    })
    await flushPromises()
    expect(wrapper.text()).not.toContain("Not a member yet ?")
    expect(lokapi.canSignup).not.toHaveBeenCalled()
  })
})
