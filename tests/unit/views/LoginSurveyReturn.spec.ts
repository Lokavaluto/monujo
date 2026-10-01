import { afterEach, describe, expect, it, vi } from "vitest"
import { flushPromises, mount, VueWrapper } from "@vue/test-utils"
import Login from "@/views/Login.vue"
import { rememberSurveyReturn, takeSurveyReturn } from "@/utils/surveyReturn"

vi.mock("@lokavaluto/lokapi-browser", () => ({ RestExc: {} }))
const wrappers: VueWrapper[] = []

function render(query: Record<string, unknown> = {}) {
  const router = { replace: vi.fn(), push: vi.fn() }
  const store = { dispatch: vi.fn() }
  const persistentStore = { get: () => "previous@example.org", set: vi.fn() }
  const biometry = {
    hasCredentialsAvailable: vi.fn().mockResolvedValue(true),
    challenge: vi.fn().mockResolvedValue(false),
  }
  const wrapper = mount(Login, {
    attachTo: document.body,
    global: {
      mocks: {
        $config: { hideAccountCreate: true },
        $gettext: (s: string) => s,
        $route: { path: "/", query, hash: "" },
        $router: router,
        $store: store,
        $lokapi: { canResetPassword: vi.fn().mockResolvedValue(false) },
        $persistentStore: persistentStore,
        $localSettings: { load: async () => ({ biometryEnabled: true }) },
        $biometry: biometry,
      },
      stubs: { "router-view": true, PasswordField: true },
    },
  })
  wrappers.push(wrapper)
  return { wrapper, router, store, persistentStore, biometry }
}

afterEach(() => {
  wrappers.splice(0).forEach(wrapper => wrapper.unmount())
  document.body.innerHTML = ""
  takeSurveyReturn()
  vi.restoreAllMocks()
})

describe("survey login prefill", () => {
  it("consumes the return once without URLs, persistence or automatic login", async () => {
    rememberSurveyReturn("  alice@example.org  ")
    const { wrapper, router, store, persistentStore, biometry } = render()
    await flushPromises()
    expect((wrapper.get('input[name="login"]').element as HTMLInputElement).value).toBe("alice@example.org")
    expect(router.replace).not.toHaveBeenCalled()
    expect(store.dispatch).not.toHaveBeenCalled()
    expect(persistentStore.set).not.toHaveBeenCalled()
    expect(biometry.challenge).not.toHaveBeenCalled()
    expect(takeSurveyReturn()).toBeUndefined()
    await wrapper.get('input[name="login"]').setValue("edited@example.org")
    expect((wrapper.vm as any).email).toBe("edited@example.org")

    // Availability is still initialized for an explicit biometric login.
    expect((wrapper.vm as any).biometryEnabled).toBe(true)
    expect((wrapper.vm as any).biometryAvailable).toBe(true)
    await (wrapper.vm as any).requestBiometricAuthentication()
    expect(biometry.challenge).toHaveBeenCalledOnce()
  })

  it.each([
    undefined, "not-email", ["a@example.org", "b@example.org"],
    { email: "a@example.org" }, "alice\u0000@example.org", "a".repeat(250) + "@example.org",
  ])("does not auto-login or overwrite the saved suggestion for return value %j", async email => {
    rememberSurveyReturn(email)
    const { wrapper, biometry } = render()
    await flushPromises()
    expect((wrapper.get('input[name="login"]').element as HTMLInputElement).value).toBe("previous@example.org")
    expect(biometry.challenge).not.toHaveBeenCalled()
  })

  it("preserves ordinary login behavior when there is no survey return", async () => {
    const { wrapper, biometry } = render()
    await flushPromises()
    expect((wrapper.vm as any).email).toBe("previous@example.org")
    expect(biometry.challenge).toHaveBeenCalledOnce()
  })

  it("does not treat an email in the route query as a survey return", async () => {
    const { wrapper, router, biometry } = render({ email: "external@example.org" })
    await flushPromises()
    expect((wrapper.vm as any).email).toBe("previous@example.org")
    expect(router.replace).not.toHaveBeenCalled()
    expect(biometry.challenge).toHaveBeenCalledOnce()
  })
})
