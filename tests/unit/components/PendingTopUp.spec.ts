import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount, flushPromises } from "@vue/test-utils"
import PendingTopUp from "@/components/PendingTopUp.vue"

vi.mock("vuex", () => ({
  mapGetters: () => ({
    numericFormat: () => (val: number) => val.toString(),
    relativeDateFormat: () => (date: string) => date,
    dateFormat: () => (date: string) => date,
  }),
}))

vi.mock("@/utils/vuex", () => ({
  mapModuleState: () => ({
    userProfile: () => ({ id: "user-1", name: "Test User" }),
  }),
}))

vi.mock("@/utils/showSpinner", () => ({
  showSpinnerMethod: () => (fn: Function) => fn,
  replaceWithLoader: vi.fn(),
}))

vi.mock("@/utils/applyDecorators", () => ({
  default: (_decorators: any[], fn: Function) => fn,
}))

describe("PendingTopUp.vue", () => {
  const mockAccount = {
    _obj: {
      internalId: "test-account",
      getPendingTopUp: vi.fn().mockResolvedValue([]),
    },
  }

  const createWrapper = (pendingTopUpList: any[] = []) => {
    mockAccount._obj.getPendingTopUp.mockResolvedValue(pendingTopUpList)

    return mount(PendingTopUp, {
      props: {
        refreshToggle: false,
        account: mockAccount,
      },
      global: {
        stubs: {
          TransactionItem: {
            name: "TransactionItem",
            template: "<div></div>",
            props: ["transaction", "account"],
            emits: ["refreshTransaction"],
          },
        },
        mocks: {
          $gettext: (msg: string) => msg,
          $config: { disableDisplayOtherUnpaidTopup: false },
          $modal: { open: vi.fn() },
        },
      },
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("pendingMyUnpaidTopUpList", () => {
    it("forwards refreshTransaction from TransactionItem to parent", async () => {
      const unpaidTopUp = {
        id: "topup-1",
        paid: false,
        requester: { id: "user-1" },
      }

      const wrapper = createWrapper([unpaidTopUp])
      await flushPromises()

      const transactionItem = wrapper.findComponent({ name: "TransactionItem" })
      transactionItem.vm.$emit("refreshTransaction")
      await flushPromises()

      expect(wrapper.emitted("refreshTransaction")).toHaveLength(1)
    })
  })

  describe("pendingOthersUnpaidTopUpList", () => {
    it("forwards refreshTransaction from TransactionItem to parent", async () => {
      const unpaidTopUp = {
        id: "topup-2",
        paid: false,
        requester: { id: "other-user" },
      }

      const wrapper = createWrapper([unpaidTopUp])
      await flushPromises()

      const transactionItem = wrapper.findComponent({ name: "TransactionItem" })
      transactionItem.vm.$emit("refreshTransaction")
      await flushPromises()

      expect(wrapper.emitted("refreshTransaction")).toHaveLength(1)
    })
  })

  describe("pendingPaidTopUpList", () => {
    it("forwards refreshTransaction from TransactionItem to parent", async () => {
      const paidTopUp = {
        id: "topup-3",
        paid: true,
        requester: { id: "user-1" },
      }

      const wrapper = createWrapper([paidTopUp])
      await flushPromises()

      const transactionItem = wrapper.findComponent({ name: "TransactionItem" })
      transactionItem.vm.$emit("refreshTransaction")
      await flushPromises()

      expect(wrapper.emitted("refreshTransaction")).toHaveLength(1)
    })
  })
})
