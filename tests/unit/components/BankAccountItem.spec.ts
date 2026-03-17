import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import BankAccountItem from "@/components/BankAccountItem.vue"

// Mock vuex
vi.mock("vuex", () => ({
  mapGetters: () => ({
    numericFormat: () => (val: number) => val.toFixed(2),
    numericPlaceholder: () => (val: number) => "-".repeat(String(val).length),
  }),
}))

vi.mock("@/utils/vuex", () => ({
  mapModuleState: () => ({
    isMultiCurrency: false,
  }),
}))

vi.mock("@lokavaluto/lokapi-browser", () => ({
  e: {
    BackendUnavailableTransient: class BackendUnavailableTransient {},
  },
}))

const globalMocks = {
  stubs: {
    Badge: true,
    DropdownMenu: true,
  },
  mocks: {
    $config: { disableBadges: true },
    $gettext: (msg: string) => msg,
  },
}

describe("BankAccountItem.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("barter limits fetching", () => {
    it("fetches getLowLimit and getHighLimit in parallel", async () => {
      const callOrder: string[] = []
      let resolveLow: (val: string) => void
      let resolveHigh: (val: string) => void

      const getLowLimit = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            callOrder.push("getLowLimit called")
            resolveLow = (val) => {
              callOrder.push("getLowLimit resolved")
              resolve(val)
            }
          })
      )

      const getHighLimit = vi.fn(
        () =>
          new Promise<string>((resolve) => {
            callOrder.push("getHighLimit called")
            resolveHigh = (val) => {
              callOrder.push("getHighLimit resolved")
              resolve(val)
            }
          })
      )

      const account = {
        isBarter: true,
        _obj: { getLowLimit, getHighLimit },
        active: true,
        bal: "100",
        curr: "EUR",
      }

      mount(BankAccountItem, {
        props: { account },
        global: globalMocks,
      })

      // Wait for mounted hook to start executing
      await vi.waitFor(() => {
        expect(getLowLimit).toHaveBeenCalled()
        expect(getHighLimit).toHaveBeenCalled()
      })

      // Both should be called BEFORE either resolves (parallel execution)
      // With sequential code, it would be: call low, resolve low, call high, resolve high
      // With parallel code, it should be: call low, call high, then resolves
      expect(callOrder).toContain("getLowLimit called")
      expect(callOrder).toContain("getHighLimit called")
      expect(callOrder).not.toContain("getLowLimit resolved")
      expect(callOrder).not.toContain("getHighLimit resolved")

      // Now resolve both
      resolveLow!("-500")
      resolveHigh!("1000")

      await flushPromises()

      // Verify both calls happened before any resolution
      const lowCallIndex = callOrder.indexOf("getLowLimit called")
      const highCallIndex = callOrder.indexOf("getHighLimit called")
      const lowResolveIndex = callOrder.indexOf("getLowLimit resolved")
      const highResolveIndex = callOrder.indexOf("getHighLimit resolved")

      // Both calls should happen before both resolves
      expect(lowCallIndex).toBeLessThan(lowResolveIndex)
      expect(highCallIndex).toBeLessThan(highResolveIndex)
      // Critical: both should be called before either resolves (proves parallelism)
      expect(lowCallIndex).toBeLessThan(lowResolveIndex)
      expect(highCallIndex).toBeLessThan(lowResolveIndex)
    })

    it("catches and logs errors from getLowLimit without crashing", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const testError = new Error("Network error")
      const account = {
        isBarter: true,
        _obj: {
          getLowLimit: vi.fn().mockRejectedValue(testError),
          getHighLimit: vi.fn().mockResolvedValue("1000"),
        },
        active: true,
        bal: "100",
        curr: "EUR",
      }

      const wrapper = mount(BankAccountItem, {
        props: { account },
        global: globalMocks,
      })

      await flushPromises()

      // Should have logged the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "An unexpected server error occurred while fetching barter limits",
        testError
      )

      // Component should not crash and limits should show placeholders
      expect(wrapper.find(".barter-limits .min").text()).toBe("-----")
      expect(wrapper.find(".barter-limits .max").text()).toBe("----")
    })

    it("catches and logs errors from getHighLimit without crashing", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const testError = new Error("Server error")
      const account = {
        isBarter: true,
        _obj: {
          getLowLimit: vi.fn().mockResolvedValue("-500"),
          getHighLimit: vi.fn().mockRejectedValue(testError),
        },
        active: true,
        bal: "100",
        curr: "EUR",
      }

      const wrapper = mount(BankAccountItem, {
        props: { account },
        global: globalMocks,
      })

      await flushPromises()

      // Should have logged the error
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "An unexpected server error occurred while fetching barter limits",
        testError
      )

      // Component should not crash and limits should show placeholders
      expect(wrapper.find(".barter-limits .min").text()).toBe("-----")
      expect(wrapper.find(".barter-limits .max").text()).toBe("----")
    })
  })
})
