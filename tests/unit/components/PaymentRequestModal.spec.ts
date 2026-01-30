import { describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import PaymentRequestModal from "../../../src/components/PaymentRequestModal.vue"

vi.mock("vuex", () => ({
  mapGetters: () => ({
    numericFormat: () => (value: number) => value.toString(),
  }),
}))

vi.mock("@/utils/account", () => ({
  getUserAccount: () => ({ parent: {} }),
}))

vi.mock("@/services/lokapiService", () => ({
  makeUIProxyBackend: () => ({}),
}))

function mountModal() {
  const paymentRequest = {
    amount: "10",
    creatorName: "Alice",
    date: "2026-01-01T00:00:00Z",
    isCreator: false,
    isSender: true,
    jsonData: {
      receiver_name: "Bob",
      sender_name: "Alice",
    },
    message: "",
    refuse: vi.fn(),
    state: "open",
  }
  const modal = {
    args: {
      value: [{ account: { curr: "EUR" }, paymentRequest }],
    },
    back: vi.fn(),
    close: vi.fn(),
    next: vi.fn(),
    step: { value: 2 },
  }

  return {
    modal,
    paymentRequest,
    wrapper: mount(PaymentRequestModal, {
      global: {
        stubs: {
          "fa-icon": true,
        },
        mocks: {
          $gettext: (message: string) => message,
          $modal: modal,
          $msg: { success: vi.fn() },
        },
      },
    }),
  }
}

describe("PaymentRequestModal.vue", () => {
  it("requires a refusal explanation with at least ten trimmed characters", async () => {
    const { wrapper } = mountModal()

    await wrapper.setData({ actionType: "refuse", explanation: " too short " })
    expect((wrapper.vm as any).explanationError).toBe(
      "Please enter an explanation of at least 10 characters"
    )

    await wrapper.setData({ explanation: " valid explanation " })
    expect((wrapper.vm as any).explanationError).toBe("")
  })

  it("trims the explanation before refusing a payment request", async () => {
    const { modal, paymentRequest, wrapper } = mountModal()
    await wrapper.setData({
      actionType: "refuse",
      explanation: "  a valid explanation  ",
    })

    await (wrapper.vm as any).confirmAction()

    expect(paymentRequest.refuse).toHaveBeenCalledWith("a valid explanation")
    expect(modal.close).toHaveBeenCalledOnce()
  })
})
