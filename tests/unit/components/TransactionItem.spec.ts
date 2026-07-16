import { describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import TransactionItem from "../../../src/components/TransactionItem.vue"

vi.mock("vuex", () => ({
  mapGetters: () => ({
    numericFormat: () => (val: number) => val.toString(),
    relativeDateFormat: () => (date: string) => date,
    dateFormat: () => (date: string) => date,
  }),
}))

vi.mock("@/utils/vuex", () => ({
  mapModuleState: () => ({
    userProfile: () => ({ id: "user-1" }),
  }),
}))

const baseTransaction = {
  amount: "10",
  currency: "EUR",
  date: "2026-01-01T00:00:00Z",
  isTopUp: true,
  isReconversion: false,
  related: "Related Fallback",
  requester: { id: "user-2", name: "Alice Recipient" },
}

describe("TransactionItem.vue", () => {
  it("shows requester name for pending top-up approvals in admin context", () => {
    const wrapper = mount(TransactionItem, {
      props: {
        transaction: baseTransaction,
        type: "topUpsPendingForApproval",
      },
      global: {
        stubs: {
          WorkflowIndicator: true,
          "fa-icon": true,
        },
        mocks: {
          $gettext: (msg: string) => msg,
          $config: {},
          $modal: { open: vi.fn() },
        },
      },
    })

    expect(wrapper.find(".custom-card-type").text()).toBe("Alice Recipient")
  })

  it("keeps generic top-up label in regular dashboard context", () => {
    const wrapper = mount(TransactionItem, {
      props: {
        transaction: baseTransaction,
      },
      global: {
        stubs: {
          WorkflowIndicator: true,
          "fa-icon": true,
        },
        mocks: {
          $gettext: (msg: string) => msg,
          $config: {},
          $modal: { open: vi.fn() },
        },
      },
    })

    expect(wrapper.find(".custom-card-type").text()).toBe("Top-up")
  })

  it("prefixes payment request requester with from when current user is asked to pay", () => {
    const wrapper = mount(TransactionItem, {
      props: {
        transaction: {
          ...baseTransaction,
          isTopUp: false,
          isPaymentRequest: true,
          isSender: true,
          pending: false,
          state: "open",
          related: "Alice Recipient",
          description: "Payment request",
        },
      },
      global: {
        stubs: {
          WorkflowIndicator: true,
          "fa-icon": true,
        },
        mocks: {
          $gettext: (msg: string) => msg,
          $config: {},
          $modal: { open: vi.fn() },
        },
      },
    })

    expect(wrapper.find("h4.custom-card-related").text()).toBe("from Alice Recipient")
  })

  it("prefixes payment request payer with to when current user requests payment", () => {
    const wrapper = mount(TransactionItem, {
      props: {
        transaction: {
          ...baseTransaction,
          isTopUp: false,
          isPaymentRequest: true,
          isSender: false,
          pending: false,
          state: "open",
          related: "Alice Recipient",
          description: "Payment request",
        },
      },
      global: {
        stubs: {
          WorkflowIndicator: true,
          "fa-icon": true,
        },
        mocks: {
          $gettext: (msg: string) => msg,
          $config: {},
          $modal: { open: vi.fn() },
        },
      },
    })

    expect(wrapper.find("h4.custom-card-related").text()).toBe("to Alice Recipient")
  })

  it("does not render false when a payment request has no description", () => {
    const wrapper = mount(TransactionItem, {
      props: {
        transaction: {
          ...baseTransaction,
          isTopUp: false,
          isPaymentRequest: true,
          isSender: false,
          pending: false,
          state: "open",
          related: "Alice Recipient",
          description: false,
        },
      },
      global: {
        stubs: {
          WorkflowIndicator: true,
          "fa-icon": true,
        },
        mocks: {
          $gettext: (msg: string) => msg,
          $config: {},
          $modal: { open: vi.fn() },
        },
      },
    })

    expect(wrapper.find(".transaction-desc").exists()).toBe(false)
    expect(wrapper.text()).not.toContain("false")
  })

  it("uses muted amount styling for a refused payment request", () => {
    const wrapper = mount(TransactionItem, {
      props: {
        transaction: {
          ...baseTransaction,
          isTopUp: false,
          isPaymentRequest: true,
          isSender: true,
          pending: false,
          state: "refused",
          related: "Alice Recipient",
          description: false,
        },
      },
      global: {
        stubs: {
          WorkflowIndicator: true,
          "fa-icon": true,
        },
        mocks: {
          $gettext: (msg: string) => msg,
          $config: {},
          $modal: { open: vi.fn() },
        },
      },
    })

    const amount = wrapper.find("h3.custom-card-related")
    expect(amount.classes()).toContain("has-text-grey")
    expect(amount.classes()).not.toContain("has-text-danger")
    expect(wrapper.classes()).toContain("refused")
  })
})
