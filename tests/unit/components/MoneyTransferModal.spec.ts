import { describe, expect, it, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"
import { defineComponent } from "vue"
import MoneyTransferModal from "../../../src/components/MoneyTransferModal.vue"

vi.mock("@/utils/account", () => ({
  getUserAccount: () => ({ parent: {} }),
}))

vi.mock("@/services/lokapiService", () => ({
  makeUIProxyBackend: () => ({}),
}))

const MoneyTransactionStub = defineComponent({
  name: "MoneyTransaction",
  emits: [
    "update:amount",
    "update:senderMemo",
    "update:recipientMemo",
    "update:isValid",
    "change",
  ],
  template: "<div class='money-transaction-stub' />",
})

const RecurrenceOptionsStub = defineComponent({
  name: "RecurrenceOptions",
  template: "<div class='recurrence-options-stub' />",
})

function makeRecipient() {
  return {
    backendId: "comchain:test",
    getSymbol: vi.fn(async () => "LKC"),
    prepareTransfer: vi.fn(async () => []),
    preparePledge: vi.fn(async () => []),
  }
}

async function mountModal(transactionType?: string) {
  const recipient = makeRecipient()
  const ownAccount = {
    currencyId: recipient.backendId,
    curr: "LKC",
    isPaymentRequestAllowed: true,
  }
  const modal = {
    args: { value: [{ account: {}, recipient, transactionType }] },
    back: vi.fn(),
    close: vi.fn(),
    next: vi.fn(),
    step: { value: 2 },
  }
  const msg = { error: vi.fn(), success: vi.fn() }
  const wrapper = mount(MoneyTransferModal, {
    global: {
      stubs: {
        MoneyTransaction: MoneyTransactionStub,
        RecurrenceOptions: RecurrenceOptionsStub,
        TransactionItem: true,
        RecipientSelector: true,
      },
      mocks: {
        $gettext: (message: string) => message,
        $modal: modal,
        $msg: msg,
        $store: {
          getters: { activeVirtualAccounts: [ownAccount] },
          dispatch: vi.fn(),
        },
      },
    },
  })
  if (!transactionType) {
    await (wrapper.vm as any).handleClickRecipient({ recipient })
  }
  await flushPromises()
  return { wrapper, recipient, msg }
}

describe("MoneyTransferModal", () => {
  describe("recurring payment option", () => {
    it("is offered for a regular payment when the account allows it", async () => {
      const { wrapper } = await mountModal()
      expect(wrapper.findComponent(RecurrenceOptionsStub).exists()).toBe(true)
    })

    it("is not offered when an administrator credits an account", async () => {
      const { wrapper } = await mountModal("adminCredit")
      expect((wrapper.vm as any).transactionType).toBe("adminCredit")
      expect(wrapper.findComponent(RecurrenceOptionsStub).exists()).toBe(false)
    })
  })
})
