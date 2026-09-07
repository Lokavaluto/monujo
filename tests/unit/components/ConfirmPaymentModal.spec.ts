import { afterEach, describe, expect, it, vi } from "vitest"
import { enableAutoUnmount, mount } from "@vue/test-utils"
import { ref } from "vue"
import ConfirmPaymentModal from "@/components/ConfirmPaymentModal.vue"
import TransactionItem from "@/components/TransactionItem.vue"
import WorkflowIndicator from "@/components/WorkflowIndicator.vue"

vi.mock("vuex", () => ({
  mapGetters: () => ({
    numericFormat: () => (value: any) => Number(value).toFixed(2),
  }),
}))
vi.mock("@/utils/vuex", () => ({
  mapModuleState: () => ({ userProfile: () => ({ id: "self" }) }),
}))
vi.mock("@/utils/showSpinner", () => ({
  showSpinnerMethod: () => (fn: any) => fn,
}))

const transaction = {
  amount: "12.50",
  currency: "LEM",
  related: "Recipient",
  date: new Date("2026-01-20T12:34:56Z"),
  tags: [],
}
// Backend credit requests have a cancel method but no pending property.
const creditRequest = {
  ...transaction,
  isTopUp: true,
  paid: false,
  cancel: () => Promise.resolve(),
  jsonData: { odoo: { order_id: 123, order_url: "https://example.com/pay" } },
}

function mountModal(args: Record<string, any> = {}, config = {}) {
  const refreshTransaction = vi.fn()
  const refreshAccounts = vi.fn()
  const modal = {
    args: ref([
      {
        type: "topup",
        transaction: creditRequest,
        account: { isTopUpAllowed: true },
        refreshTransaction,
        refreshAccounts,
        ...args,
      },
    ]),
    modal: ref("ConfirmPaymentModal"),
    close: vi.fn(),
  }
  const msg = { success: vi.fn(), error: vi.fn() }
  const wrapper = mount(ConfirmPaymentModal, {
    global: {
      mocks: {
        $modal: modal,
        $msg: msg,
        $config: config,
        $gettext: (text: string, params: Record<string, string> = {}) =>
          text.replace(/%{\s*(\w+)\s*}/g, (_, key) => params[key]),
      },
      stubs: {
        "fa-icon": true,
        TransactionItem: {
          props: ["transaction", "mode"],
          template: "<div />",
        },
        WorkflowIndicator: true,
      },
    },
  })
  const buttons = () =>
    wrapper.findAll("footer button").map((btn) => btn.text())
  const names = () =>
    wrapper.findAll("p.frame3-sub-title.has-text-weight-bold").map((p) => p.text())
  return {
    wrapper,
    vm: wrapper.vm as any,
    modal,
    msg,
    refreshTransaction,
    refreshAccounts,
    buttons,
    names,
  }
}

enableAutoUnmount(afterEach)
afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe("ConfirmPaymentModal", () => {
  describe("Top-up requests", () => {
    it.each([false, true])(
      "describes a request as requested when paid=%s",
      (paid) => {
        const { wrapper, buttons } = mountModal({
          transaction: { ...creditRequest, paid },
          source: "askTopUp",
        })
        expect(wrapper.get(".custom-card-title").text()).toBe(
          "Top-up requested"
        )
        expect(wrapper.get("p.amount").text()).toBe("Requested 12.50 LEM")
        expect(buttons()).toEqual(paid ? ["Ok"] : ["Delete", "Pay", "Ok"])
        expect(wrapper.text()).toContain(
          paid
            ? "waiting for an administrator"
            : "waiting for you to pay it or delete it"
        )
        expect(wrapper.get(".notification").text()).toContain(
          "already have a pending top-up"
        )
      }
    )

    it("describes completed top-up history as received", () => {
      const { wrapper, buttons } = mountModal({
        transaction: { ...transaction, isTopUp: true, paid: true },
      })
      expect(wrapper.get(".custom-card-title").text()).toBe("Top-up received")
      expect(wrapper.get("p.amount").text()).toBe("Received 12.50 LEM")
      expect(wrapper.text()).not.toContain("waiting for an administrator")
      expect(buttons()).toEqual(["Ok"])
    })

    it.each([false, true])(
      "requires pending=true for unpaid history (pending=%s)",
      (pending) => {
        const { buttons } = mountModal({
          transaction: { ...transaction, isTopUp: true, paid: false, pending },
        })
        expect(buttons()).toEqual(pending ? ["Delete", "Pay", "Ok"] : ["Ok"])
      }
    )

    it.each([
      {
        scenario: "own request",
        requester: { id: "self", name: "Me" },
        allowed: true,
        actionable: true,
        names: [],
      },
      {
        scenario: "another payer",
        requester: { id: "other", name: "Payer" },
        allowed: true,
        actionable: false,
        names: ["Payer"],
      },
      {
        scenario: "top-ups disabled",
        requester: undefined,
        allowed: false,
        actionable: false,
        names: [],
      },
    ])("respects ownership and permissions: $scenario", (scenario) => {
      const { wrapper, buttons, names } = mountModal({
        transaction: { ...creditRequest, requester: scenario.requester },
        account: { isTopUpAllowed: scenario.allowed },
      })
      expect(buttons()).toEqual(
        scenario.actionable ? ["Delete", "Pay", "Ok"] : ["Ok"]
      )
      expect(names()).toEqual(scenario.names)
      expect(
        wrapper.text().includes("waiting for you to pay it or delete it")
      ).toBe(scenario.actionable)
    })
  })

  describe("Transaction display", () => {
    it.each([
      {
        amount: "-12.50",
        pending: true,
        status: "sent",
        sentence: "Sent 12.50 LEM",
        label: "to",
      },
      {
        amount: "12.50",
        pending: false,
        status: "processed",
        sentence: "Received 12.50 LEM",
        label: "from",
      },
    ])("shows the counterparty and direction for $amount", (scenario) => {
      const { wrapper, names } = mountModal({
        type: "transactionDetail",
        transaction: {
          ...transaction,
          amount: scenario.amount,
          pending: scenario.pending,
        },
      })
      expect(wrapper.get(".custom-card-title").text()).toBe(
        `Transaction ${scenario.status}`
      )
      expect(wrapper.get("p.amount").text()).toBe(scenario.sentence)
      expect(wrapper.get("h2").text()).toBe(scenario.label)
      expect(names()).toEqual(["Recipient"])
    })

    it("does not apply top-up wording to ordinary transaction details", () => {
      const { wrapper } = mountModal({
        type: "transactionDetail",
        transaction: { ...creditRequest, isTopUp: false, paid: true },
      })
      expect(wrapper.get("p.amount").text()).toBe("Received 12.50 LEM")
      expect(wrapper.text()).not.toContain("waiting for an administrator")
    })

    it("confirms split payments with an exact total, rows, and currency indicators", () => {
      const transactions = [
        { ...transaction, amount: "-0.1" },
        {
          ...transaction,
          amount: "-0.2",
          tags: ["barter", "unknown-currency"],
        },
      ]
      const { wrapper } = mountModal({
        type: "paymentConfirmation",
        transaction: transactions,
      })
      expect(wrapper.get(".modal-card-title").text()).toBe(
        "Payment confirmation"
      )
      expect(wrapper.get(".custom-card-title").text()).toBe("Payment sent")
      expect(wrapper.get("p.amount.cm").text()).toBe("Sent 0.30 LEM")
      expect(wrapper.get("p.amount span.amount").text()).toBe("0.30")
      expect(wrapper.get(".unknown-currency-warning").text()).toContain(
        "unrecognized currency"
      )
      expect(
        wrapper.findAllComponents(TransactionItem).map((row) => row.props())
      ).toEqual(
        transactions.map((transaction) => ({ transaction, mode: "small" }))
      )
    })

    it.each([
      { stage: true, label: "sent" },
      { stage: "paid", label: "processed" },
    ])("shows reconversion stage $stage as $label", ({ stage, label }) => {
      const { wrapper, names } = mountModal({
        type: "reconversion",
        transaction: {
          ...transaction,
          amount: "-12.50",
          isReconversion: stage,
        },
      })
      expect(wrapper.get(".custom-card-title").text()).toBe(
        `Reconversion ${label}`
      )
      expect(wrapper.getComponent(WorkflowIndicator).props("current")).toBe(
        label
      )
      expect(names()).toEqual([])
    })

    it.each([
      { scenario: "unknown stage", stage: "unexpected-stage", disabled: false },
      {
        scenario: "disabled in configuration",
        stage: "received",
        disabled: true,
      },
    ])("hides the reconversion workflow: $scenario", ({ stage, disabled }) => {
      const { wrapper } = mountModal(
        {
          type: "reconversion",
          transaction: { ...transaction, isReconversion: stage },
        },
        { disableReconversionStatusDisplay: disabled }
      )
      expect(wrapper.findComponent(WorkflowIndicator).exists()).toBe(false)
    })
  })

  describe("Administrative approvals", () => {
    it.each([
      {
        scenario: "current user is the payer",
        requester: { id: "self", name: "Me" },
        names: ["Me", "Recipient"],
      },
      {
        scenario: "payer and recipient match",
        requester: { id: "other", name: "Recipient" },
        names: ["Recipient"],
      },
      {
        scenario: "requester is absent",
        requester: undefined,
        names: ["Recipient"],
      },
    ])("shows the available parties: $scenario", (scenario) => {
      const { wrapper, names, buttons } = mountModal({
        type: "topUpsPendingForApproval",
        transaction: {
          ...creditRequest,
          paid: true,
          requester: scenario.requester,
        },
      })
      expect(names()).toEqual(scenario.names)
      expect(buttons()).toEqual(["Approve", "Ok"])
      expect(wrapper.get("p.amount").text()).toBe("Requested 12.50 LEM")
    })

    it("refreshes and closes after successful approval", async () => {
      const validate = vi.fn().mockResolvedValue(undefined)
      const { vm, modal, msg, refreshAccounts } = mountModal({
        type: "topUpsPendingForApproval",
        transaction: { ...creditRequest, paid: true, validate },
      })
      await vm.handleApprove()
      expect(validate).toHaveBeenCalledOnce()
      expect(refreshAccounts).toHaveBeenCalledWith(true)
      expect(modal.close).toHaveBeenCalledOnce()
      expect(msg.success).toHaveBeenCalledOnce()
    })

    it("silently keeps the modal open when the user cancels approval", async () => {
      const validate = vi
        .fn()
        .mockRejectedValue(new Error("User canceled the dialog box"))
      const { vm, modal, msg } = mountModal({
        type: "topUpsPendingForApproval",
        transaction: { ...creditRequest, paid: true, validate },
      })
      await vm.handleApprove()
      expect(modal.close).not.toHaveBeenCalled()
      expect(msg.success).not.toHaveBeenCalled()
      expect(msg.error).not.toHaveBeenCalled()
    })

    it("reports an approval error without closing", async () => {
      const error = new Error("Server unavailable")
      const validate = vi.fn().mockRejectedValue(error)
      const { vm, modal, msg } = mountModal({
        type: "topUpsPendingForApproval",
        transaction: { ...creditRequest, paid: true, validate },
      })
      await expect(vm.handleApprove()).rejects.toThrow(error)
      expect(msg.error).toHaveBeenCalledOnce()
      expect(modal.close).not.toHaveBeenCalled()
      expect(msg.success).not.toHaveBeenCalled()
    })
  })

  describe("Top-up actions", () => {
    it("cancels a request, refreshes transactions and balances, then closes", async () => {
      const cancel = vi.fn().mockResolvedValue(undefined)
      const { vm, modal, refreshTransaction, refreshAccounts } = mountModal({
        transaction: { ...creditRequest, cancel },
      })
      await vm.cancelTopUpRequest()
      expect(cancel).toHaveBeenCalledOnce()
      expect(refreshTransaction).toHaveBeenCalledOnce()
      expect(refreshAccounts).toHaveBeenCalledWith(true)
      expect(modal.close).toHaveBeenCalledOnce()
    })

    it("reports cancellation failure without closing or claiming success", async () => {
      const cancel = vi.fn().mockRejectedValue(new Error("Server unavailable"))
      const { vm, modal, msg } = mountModal({
        transaction: { ...creditRequest, cancel },
      })
      await expect(vm.cancelTopUpRequest()).rejects.toThrow(
        "An error occurred while deleting top-up request"
      )
      expect(modal.close).not.toHaveBeenCalled()
      expect(msg.success).not.toHaveBeenCalled()
    })

    it("waits for the matching unpaid order to disappear before closing", async () => {
      vi.useFakeTimers()
      const open = vi.spyOn(window, "open").mockReturnValue(null)
      const getPendingTopUp = vi
        .fn()
        .mockResolvedValueOnce([creditRequest])
        .mockResolvedValueOnce([
          { ...creditRequest, jsonData: { odoo: { order_id: 999 } } },
        ])
      const { vm, modal, refreshAccounts } = mountModal({
        account: { _obj: { getPendingTopUp } },
      })
      const payment = vm.payTopUpRequest()
      expect(open).toHaveBeenCalledWith("https://example.com/pay", "_blank")
      await vi.advanceTimersByTimeAsync(5000)
      expect(modal.close).not.toHaveBeenCalled()
      await vi.advanceTimersByTimeAsync(5000)
      await payment
      expect(modal.close).toHaveBeenCalledOnce()
      expect(refreshAccounts).toHaveBeenCalledWith(true)
      expect(vi.getTimerCount()).toBe(0)
    })

    it("stops polling when the modal closes", async () => {
      vi.useFakeTimers()
      vi.spyOn(window, "open").mockReturnValue(null)
      const getPendingTopUp = vi.fn()
      const { vm, modal, msg } = mountModal({
        account: { _obj: { getPendingTopUp } },
      })
      const payment = vm.payTopUpRequest()
      modal.modal.value = ""
      await vi.advanceTimersByTimeAsync(5000)
      await payment
      expect(getPendingTopUp).not.toHaveBeenCalled()
      expect(msg.success).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    })

    it("reports polling failure and clears its timer", async () => {
      vi.useFakeTimers()
      vi.spyOn(window, "open").mockReturnValue(null)
      vi.spyOn(console, "error").mockImplementation(() => {})
      const getPendingTopUp = vi
        .fn()
        .mockRejectedValue(new Error("Server unavailable"))
      const { vm, modal } = mountModal({
        account: { _obj: { getPendingTopUp } },
      })
      const result = expect(vm.payTopUpRequest()).rejects.toThrow(
        "An unexpected server error occurred while fetching pending topup list"
      )
      await vi.advanceTimersByTimeAsync(5000)
      await result
      expect(modal.close).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
