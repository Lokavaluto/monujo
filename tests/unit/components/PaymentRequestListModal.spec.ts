import { describe, expect, it, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"

import PaymentRequestListModal from "../../../src/components/PaymentRequestListModal.vue"
import UseBatchLoading from "@/services/UseBatchLoading"
import { getUserAccount } from "@/utils/account"

vi.mock("@/services/UseBatchLoading", () => ({
  default: vi.fn(),
}))

vi.mock("@/utils/account", () => ({
  getUserAccount: vi.fn(),
}))

function mountModal(paymentRequestList: any[] = []) {
  const batchLoader = {
    elements: [{ name: "Alice" }, { name: "Bob" }],
    getNextElements: vi.fn(),
    isNewBatchLoading: false,
    newGen: vi.fn(),
  }
  const getPaymentRequests = vi.fn()
  const refreshTransaction = vi.fn()
  const refreshAccounts = vi.fn()
  const searchRecipients = vi.fn()

  vi.mocked(UseBatchLoading).mockReturnValue(batchLoader as any)
  vi.mocked(getUserAccount).mockReturnValue({
    getPaymentRequests,
    parent: { searchRecipients },
  } as any)

  const modal = {
    args: {
      value: [
        {
          account: { curr: "EUR" },
          paymentRequestList,
          refreshAccounts,
          refreshTransaction,
        },
      ],
    },
    back: vi.fn(),
    modal: { value: "PaymentRequestListModal" },
    open: vi.fn(),
  }

  const wrapper = mount(PaymentRequestListModal, {
    global: {
      stubs: {
        DatePicker: true,
        ModelListSelect: {
          template: '<div class="menu"></div>',
        },
        TransactionItem: true,
        "fa-icon": true,
      },
      mocks: {
        $gettext: (message: string) => message,
        $modal: modal,
        $msg: { error: vi.fn() },
      },
    },
  })

  return {
    batchLoader,
    getPaymentRequests,
    modal,
    refreshAccounts,
    refreshTransaction,
    wrapper,
  }
}

describe("PaymentRequestListModal.vue", () => {
  it("combines status, date, and contact filters", async () => {
    const includedRequest = {
      date: new Date("2026-03-10T12:00:00Z"),
      id: "included",
      jsonData: { sender_name: "Alice" },
      state: "refused",
    }
    const { wrapper } = mountModal([
      includedRequest,
      {
        date: new Date("2026-03-11T12:00:00Z"),
        id: "open",
        related: "Alice",
        state: "open",
      },
      {
        date: new Date("2026-03-12T12:00:00Z"),
        id: "other-contact",
        related: "Bob",
        state: "refused",
      },
      {
        creatorName: "Alice",
        date: new Date("2026-04-01T12:00:00Z"),
        id: "outside-range",
        state: "refused",
      },
    ])

    await wrapper.setData({
      filterDate: [
        new Date(2026, 2, 1),
        new Date(2026, 2, 31),
      ],
      selectedRecipientIdx: 0,
      showRefusedOnly: true,
    })
    await flushPromises()

    expect((wrapper.vm as any).filteredPaymentRequestList).toEqual([
      includedRequest,
    ])
  })

  it("refreshes the modal list and notifies the dashboard", async () => {
    const { getPaymentRequests, refreshTransaction, wrapper } = mountModal()
    const refreshedRequests = [{ id: "request", state: "open" }]
    getPaymentRequests.mockResolvedValue(refreshedRequests)

    ;(wrapper.vm as any).refreshPaymentRequestList()
    await flushPromises()

    expect(getPaymentRequests).toHaveBeenCalledWith(["open", "refused"])
    expect((wrapper.vm as any).paymentRequestList).toEqual([
      { ...refreshedRequests[0], currency: "EUR" },
    ])
    expect(refreshTransaction).toHaveBeenCalledOnce()
  })
})
