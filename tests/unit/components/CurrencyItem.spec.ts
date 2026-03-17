import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import CurrencyItem from "@/components/CurrencyItem.vue"

// Mock vuex
vi.mock("vuex", () => ({
  mapGetters: () => ({
    numericFormat: () => (val: number) =>
      Number.isNaN(val) ? "NaN" : val.toFixed(2),
    numericPlaceholder: () => (sample: number) =>
      sample.toFixed(2).replace(/\d/g, "-"),
  }),
}))

let mockIsMultiCurrency = false

vi.mock("@/utils/vuex", () => ({
  mapModuleState: () => ({
    isMultiCurrency: { get: () => mockIsMultiCurrency },
  }),
}))

const { BackendUnavailableTransient } = vi.hoisted(() => ({
  BackendUnavailableTransient: class BackendUnavailableTransient {},
}))

vi.mock("@lokavaluto/lokapi-browser", () => ({
  e: { BackendUnavailableTransient },
}))

const createMockCurrency = (overrides: Partial<{
  getCurrencySupply: () => Promise<number>
  getSymbol: () => Promise<string>
  getCurrencyName: () => Promise<string>
}> = {}) => {
  const { getCurrencySupply: supplyOverride, ...rest } = overrides
  return {
    getCurrencySupply: Object.assign(
      supplyOverride ?? vi.fn().mockResolvedValue(1000),
      { clearCache: vi.fn() },
    ),
    getSymbol: vi.fn().mockResolvedValue("EUR"),
    getCurrencyName: vi.fn().mockResolvedValue("Euro"),
    ...rest,
  }
}

const createGlobalMocks = (msgErrorMock: ReturnType<typeof vi.fn>) => ({
  stubs: {
    DropdownMenu: true,
  },
  mocks: {
    $gettext: (msg: string) => msg,
    $msg: { error: msgErrorMock },
  },
})

describe("CurrencyItem.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe("refreshCurrencyData", () => {
    it("displays currency data correctly when all fetches succeed", async () => {
      const msgErrorMock = vi.fn()
      const currency = createMockCurrency()

      const wrapper = mount(CurrencyItem, {
        props: {
          currency,
          isCurrencySelected: false,
          disableDropDown: true,
        },
        global: createGlobalMocks(msgErrorMock),
      })

      await flushPromises()

      expect(wrapper.find(".currency-name").text()).toBe("Euro")
      expect(wrapper.find(".currency-supply").text()).toBe("1000.00")
      expect(wrapper.find(".currency-symbol").text()).toBe("EUR")
      expect(msgErrorMock).not.toHaveBeenCalled()
    })

    it("shows placeholder and triggers error for each individual fetch failure", async () => {
      const fields = [
        { method: "getCurrencySupply", selector: ".currency-supply", ok: "1000.00", fail: "--------.--" },
        { method: "getSymbol", selector: ".currency-symbol", ok: "EUR", fail: "???" },
        { method: "getCurrencyName", selector: ".currency-name", ok: "Euro", fail: "unavailable" },
      ]

      for (const failing of fields) {
        const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {})
        const msgErrorMock = vi.fn()

        const currency = createMockCurrency({
          [failing.method]: vi.fn().mockRejectedValue(new Error("fetch failed")),
        })

        const wrapper = mount(CurrencyItem, {
          props: { currency, isCurrencySelected: false, disableDropDown: true },
          global: createGlobalMocks(msgErrorMock),
        })

        await flushPromises()

        for (const field of fields) {
          const expected = field === failing ? field.fail : field.ok
          expect(wrapper.find(field.selector).text()).toBe(expected)
          // Check that unavailable class is applied only to the failed field
          const hasUnavailableClass = wrapper.find(field.selector).classes().includes("unavailable")
          expect(hasUnavailableClass).toBe(field === failing)
        }
        expect(msgErrorMock).toHaveBeenCalled()
        expect(consoleErrorSpy).toHaveBeenCalled()

        vi.restoreAllMocks()
      }
    })
  })

  describe("isTemporarilyUnavailable", () => {
    it("displays unavailable message when currency is BackendUnavailableTransient", async () => {
      const msgErrorMock = vi.fn()
      const currency = [new BackendUnavailableTransient()]

      const wrapper = mount(CurrencyItem, {
        props: { currency, isCurrencySelected: false, disableDropDown: true },
        global: createGlobalMocks(msgErrorMock),
      })

      await flushPromises()

      expect(wrapper.find(".currency-backend.error-msg").exists()).toBe(true)
      expect(wrapper.find(".currency-backend.error-msg").text()).toBe(
        "Temporarily unavailable - please refresh"
      )
    })

    it("skips refresh when watcher triggers on temporarily unavailable currency", async () => {
      const msgErrorMock = vi.fn()
      const currency = [new BackendUnavailableTransient()]

      const wrapper = mount(CurrencyItem, {
        props: {
          currency,
          isCurrencySelected: false,
          disableDropDown: true,
          refreshCurrency: false,
        },
        global: createGlobalMocks(msgErrorMock),
      })

      await flushPromises()

      // Trigger the watcher by changing refreshCurrency prop
      await wrapper.setProps({ refreshCurrency: true } as any)
      await flushPromises()

      // Should still show unavailable message, no errors from trying to call methods on array
      expect(wrapper.find(".currency-backend.error-msg").exists()).toBe(true)
      expect(msgErrorMock).not.toHaveBeenCalled()
    })
  })

  describe("isMultiCurrency", () => {
    it("displays backend name when isMultiCurrency is true", async () => {
      mockIsMultiCurrency = true
      const msgErrorMock = vi.fn()
      const currency = { ...createMockCurrency(), backend: { internalId: "test-backend" } }

      const wrapper = mount(CurrencyItem, {
        props: { currency, isCurrencySelected: false, disableDropDown: true },
        global: createGlobalMocks(msgErrorMock),
      })

      await flushPromises()

      const backendEl = wrapper.find(".currency-backend:not(.error-msg)")
      expect(backendEl.exists()).toBe(true)
      expect(backendEl.text()).toBe("test-backend")

      mockIsMultiCurrency = false
    })

    it("does not display backend name when isMultiCurrency is false", async () => {
      mockIsMultiCurrency = false
      const msgErrorMock = vi.fn()
      const currency = { ...createMockCurrency(), backend: { internalId: "test-backend" } }

      const wrapper = mount(CurrencyItem, {
        props: { currency, isCurrencySelected: false, disableDropDown: true },
        global: createGlobalMocks(msgErrorMock),
      })

      await flushPromises()

      const backendEl = wrapper.find(".currency-backend:not(.error-msg)")
      expect(backendEl.exists()).toBe(false)
    })
  })
})
