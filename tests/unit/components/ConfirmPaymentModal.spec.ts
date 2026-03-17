import { describe, it, expect, vi, beforeEach } from "vitest"
import { mount } from "@vue/test-utils"
import ConfirmPaymentModal from "@/components/ConfirmPaymentModal.vue"

vi.mock("vuex", () => ({
  mapGetters: () => ({
    numericFormat: () => (val: string) => val,
  }),
}))

vi.mock("@/utils/vuex", () => ({
  mapModuleState: () => ({
    userProfile: () => ({ id: "test-user-id" }),
  }),
}))

describe("ConfirmPaymentModal.vue - Top-up Actions", () => {
  let mockModal: any
  let mockGettext: any

  beforeEach(() => {
    mockModal = {
      args: {
        value: [{}],
      },
      modal: {
        value: "ConfirmPaymentModal",
      },
      close: vi.fn(),
    }

    mockGettext = vi.fn((text: string, params?: any) => {
      if (params) {
        let result = text
        Object.keys(params).forEach((key) => {
          result = result.replace(`%{${key}}`, params[key])
        })
        return result
      }
      return text
    })
  })

  it("hides pay/delete when top-up is paid", async () => {
    const paidTopUp = {
      isTopUp: true,
      paid: true,
      pending: false,
      amount: "50.00",
      currency: "EUR",
      date: new Date(),
      requester: undefined,
    }

    mockModal.args.value[0] = {
      type: "topup",
      transaction: paidTopUp,
      account: { isTopUpAllowed: true },
    }

    const wrapper = mount(ConfirmPaymentModal, {
      global: {
        mocks: {
          $modal: mockModal,
          $gettext: mockGettext,
          $config: {},
        },
        stubs: {
          "fa-icon": true,
          TransactionItem: true,
          WorkflowIndicator: true,
        },
      },
    })

    expect(wrapper.find("#delete").exists()).toBe(false)
    const payButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Pay"))
    expect(payButton).toBeUndefined()
  })

  it("hides pay/delete when top-up is not pending", async () => {
    const notPendingTopUp = {
      isTopUp: true,
      paid: false,
      pending: false,
      amount: "11.00",
      currency: "LEM",
      date: new Date(),
      requester: undefined,
    }

    mockModal.args.value[0] = {
      type: "topup",
      transaction: notPendingTopUp,
      account: { isTopUpAllowed: true },
    }

    const wrapper = mount(ConfirmPaymentModal, {
      global: {
        mocks: {
          $modal: mockModal,
          $gettext: mockGettext,
          $config: {},
        },
        stubs: {
          "fa-icon": true,
          TransactionItem: true,
          WorkflowIndicator: true,
        },
      },
    })

    expect(wrapper.find("#delete").exists()).toBe(false)
    const payButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Pay"))
    expect(payButton).toBeUndefined()
  })

  it("shows pay/delete when top-up is pending and unpaid", async () => {
    const pendingTopUp = {
      isTopUp: true,
      paid: false,
      pending: true,
      amount: "50.00",
      currency: "EUR",
      date: new Date(),
      requester: undefined,
      jsonData: {
        odoo: {
          order_url: "https://example.com/pay",
          order_id: 123,
        },
      },
    }

    mockModal.args.value[0] = {
      type: "topup",
      transaction: pendingTopUp,
      account: {
        isTopUpAllowed: true,
        _obj: { getPendingTopUp: vi.fn().mockResolvedValue([]) },
      },
    }

    const wrapper = mount(ConfirmPaymentModal, {
      global: {
        mocks: {
          $modal: mockModal,
          $gettext: mockGettext,
          $config: {},
        },
        stubs: {
          "fa-icon": true,
          TransactionItem: true,
          WorkflowIndicator: true,
        },
      },
    })

    expect(wrapper.find("#delete").exists()).toBe(true)
    const payButton = wrapper
      .findAll("button")
      .find((btn) => btn.text().includes("Pay"))
    expect(payButton).toBeDefined()
  })

  describe("My unpaid top-up requests", () => {
    /**
     * This test simulates the actual CreditRequest object from getPendingTopUp()
     * which has a `cancel` method but NO `pending` property.
     * The modal should show Pay/Delete buttons based on `cancel` method existence.
     */
    it("shows pay and delete buttons for CreditRequest with cancel method (from getPendingTopUp)", async () => {
      const creditRequest = {
        isTopUp: true,
        paid: false,
        // NO pending property - this is how CreditRequest from lokapi works
        cancel: vi.fn(), // Has cancel method
        amount: "11.00",
        currency: "LEM",
        date: new Date(),
        requester: undefined,
        jsonData: {
          odoo: {
            order_url: "https://example.com/pay",
            order_id: 456,
          },
        },
      }

      mockModal.args.value[0] = {
        type: "topup",
        transaction: creditRequest,
        account: {
          isTopUpAllowed: true,
          _obj: { getPendingTopUp: vi.fn().mockResolvedValue([]) },
        },
      }

      const wrapper = mount(ConfirmPaymentModal, {
        global: {
          mocks: {
            $modal: mockModal,
            $gettext: mockGettext,
            $config: {},
          },
          stubs: {
            "fa-icon": true,
            TransactionItem: true,
            WorkflowIndicator: true,
          },
        },
      })

      // Should show Delete button
      expect(wrapper.find("#delete").exists()).toBe(true)

      // Should show Pay button
      const payButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Pay"))
      expect(payButton).toBeDefined()
    })

    it("shows pay and delete buttons for own unpaid pending top-up request", async () => {
      const myUnpaidTopUp = {
        isTopUp: true,
        paid: false,
        pending: true,
        amount: "25.00",
        currency: "LEM",
        date: new Date(),
        requester: undefined, // own request (no requester means current user)
        jsonData: {
          odoo: {
            order_url: "https://example.com/pay",
            order_id: 456,
          },
        },
      }

      mockModal.args.value[0] = {
        type: "topup",
        transaction: myUnpaidTopUp,
        account: {
          isTopUpAllowed: true,
          _obj: { getPendingTopUp: vi.fn().mockResolvedValue([]) },
        },
      }

      const wrapper = mount(ConfirmPaymentModal, {
        global: {
          mocks: {
            $modal: mockModal,
            $gettext: mockGettext,
            $config: {},
          },
          stubs: {
            "fa-icon": true,
            TransactionItem: true,
            WorkflowIndicator: true,
          },
        },
      })

      // Should show Delete button
      expect(wrapper.find("#delete").exists()).toBe(true)

      // Should show Pay button
      const payButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Pay"))
      expect(payButton).toBeDefined()
    })

    it("shows pay and delete buttons when requester.id matches current user", async () => {
      const myUnpaidTopUp = {
        isTopUp: true,
        paid: false,
        pending: true,
        amount: "30.00",
        currency: "LEM",
        date: new Date(),
        requester: { id: "test-user-id", name: "Test User" }, // matches userProfile.id
        jsonData: {
          odoo: {
            order_url: "https://example.com/pay",
            order_id: 789,
          },
        },
      }

      mockModal.args.value[0] = {
        type: "topup",
        transaction: myUnpaidTopUp,
        account: {
          isTopUpAllowed: true,
          _obj: { getPendingTopUp: vi.fn().mockResolvedValue([]) },
        },
      }

      const wrapper = mount(ConfirmPaymentModal, {
        global: {
          mocks: {
            $modal: mockModal,
            $gettext: mockGettext,
            $config: {},
          },
          stubs: {
            "fa-icon": true,
            TransactionItem: true,
            WorkflowIndicator: true,
          },
        },
      })

      // Should show Delete button
      expect(wrapper.find("#delete").exists()).toBe(true)

      // Should show Pay button
      const payButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Pay"))
      expect(payButton).toBeDefined()
    })

    it("hides pay and delete buttons when requester is a different user", async () => {
      const otherUserTopUp = {
        isTopUp: true,
        paid: false,
        pending: true,
        amount: "40.00",
        currency: "LEM",
        date: new Date(),
        requester: { id: "other-user-id", name: "Other User" }, // different user
        jsonData: {
          odoo: {
            order_url: "https://example.com/pay",
            order_id: 999,
          },
        },
      }

      mockModal.args.value[0] = {
        type: "topup",
        transaction: otherUserTopUp,
        account: {
          isTopUpAllowed: true,
          _obj: { getPendingTopUp: vi.fn().mockResolvedValue([]) },
        },
      }

      const wrapper = mount(ConfirmPaymentModal, {
        global: {
          mocks: {
            $modal: mockModal,
            $gettext: mockGettext,
            $config: {},
          },
          stubs: {
            "fa-icon": true,
            TransactionItem: true,
            WorkflowIndicator: true,
          },
        },
      })

      // Should NOT show Delete button
      expect(wrapper.find("#delete").exists()).toBe(false)

      // Should NOT show Pay button
      const payButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Pay"))
      expect(payButton).toBeUndefined()
    })

    it("hides pay and delete buttons when account does not allow top-ups", async () => {
      const myUnpaidTopUp = {
        isTopUp: true,
        paid: false,
        pending: true,
        amount: "20.00",
        currency: "LEM",
        date: new Date(),
        requester: undefined,
        jsonData: {
          odoo: {
            order_url: "https://example.com/pay",
            order_id: 111,
          },
        },
      }

      mockModal.args.value[0] = {
        type: "topup",
        transaction: myUnpaidTopUp,
        account: {
          isTopUpAllowed: false, // top-ups not allowed
          _obj: { getPendingTopUp: vi.fn().mockResolvedValue([]) },
        },
      }

      const wrapper = mount(ConfirmPaymentModal, {
        global: {
          mocks: {
            $modal: mockModal,
            $gettext: mockGettext,
            $config: {},
          },
          stubs: {
            "fa-icon": true,
            TransactionItem: true,
            WorkflowIndicator: true,
          },
        },
      })

      // Should NOT show Delete button
      expect(wrapper.find("#delete").exists()).toBe(false)

      // Should NOT show Pay button
      const payButton = wrapper
        .findAll("button")
        .find((btn) => btn.text().includes("Pay"))
      expect(payButton).toBeUndefined()
    })
  })
})
