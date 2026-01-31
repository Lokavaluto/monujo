import { describe, expect, it, vi } from "vitest"
import { mount } from "@vue/test-utils"
import ImportPaymentRequestsModal from "../../../src/components/ImportPaymentRequestsModal.vue"

vi.mock("@/utils/account", () => ({
  getUserAccount: () => ({ internalId: "comchain:self" }),
}))

function mountModal() {
  return mount(ImportPaymentRequestsModal, {
    global: {
      stubs: {
        "fa-icon": true,
      },
      mocks: {
        $gettext: (message: string) => message,
        $ngettext: (singular: string, plural: string, count: number) =>
          count === 1 ? singular : plural,
        $modal: {
          args: { value: [{ account: {} }] },
          close: vi.fn(),
        },
      },
    },
  })
}

describe("ImportPaymentRequestsModal.vue", () => {
  it("shows the import action in the status area initially", () => {
    const wrapper = mountModal()
    const status = wrapper.get(".is-file-picker")

    expect(status.text()).toBe("Import file")
    expect(status.classes()).toContain("is-boxed")
    expect(status.classes()).toContain("is-light")
    expect(
      status.find('fa-icon-stub[icon="cloud-arrow-up"]').exists()
    ).toBe(true)
    expect(
      wrapper.get(".modal-card-head .delete").attributes("aria-label")
    ).toBe("Close")
  })

  it("shows the top-right remove control after validating a file", async () => {
    const wrapper = mountModal()

    ;(wrapper.vm as any).validateAndParseCSV(
      "related_wallet,amount\n0xABC,12.5"
    )
    await wrapper.vm.$nextTick()

    const status = wrapper.get(".import-status.is-success")
    const removeButton = status.get("button")

    expect(removeButton.classes()).toContain("delete")
    expect(removeButton.attributes("aria-label")).toBe("Remove file")

    await removeButton.trigger("click")

    expect((wrapper.vm as any).parsedRequests).toEqual([])
    expect(wrapper.get(".is-file-picker").text()).toBe("Import file")
  })

  it("shows the top-right remove control for an invalid file", async () => {
    const wrapper = mountModal()
    const vm = wrapper.vm as any

    vm.selectedFileName = "invalid.csv"
    vm.validateAndParseCSV("related_wallet,amount\n0xABC,0")
    await wrapper.vm.$nextTick()

    const status = wrapper.get(".import-status.is-danger")
    const removeButton = status.get("button")
    expect(wrapper.find(".is-file-picker").exists()).toBe(false)
    expect(removeButton.classes()).toContain("delete")
    expect(removeButton.attributes("aria-label")).toBe("Remove file")

    await removeButton.trigger("click")

    expect(vm.validationError).toBe("")
    expect(vm.selectedFileName).toBe("")
    expect(wrapper.get(".is-file-picker").text()).toBe("Import file")
  })

  it("maps positive and negative CSV amounts to the correct wallets", () => {
    const wrapper = mountModal()

    ;(wrapper.vm as any).validateAndParseCSV(
      "related_wallet,amount\n0xABC,12.5\n0xDEF,-3"
    )

    expect((wrapper.vm as any).validationError).toBe("")
    expect((wrapper.vm as any).parsedRequests).toEqual([
      {
        sender_wallet_uri: "comchain:abc",
        receiver_wallet_uri: "comchain:self",
        amount: 12.5,
      },
      {
        sender_wallet_uri: "comchain:self",
        receiver_wallet_uri: "comchain:def",
        amount: 3,
      },
    ])
  })

  it("accepts semicolon-separated CSV with a decimal comma", () => {
    const wrapper = mountModal()

    ;(wrapper.vm as any).validateAndParseCSV(
      "related_wallet;amount\n0xABC;12,5"
    )

    expect((wrapper.vm as any).validationError).toBe("")
    expect((wrapper.vm as any).parsedRequests[0].amount).toBe(12.5)
  })

  it("rejects zero-value payment requests", () => {
    const wrapper = mountModal()

    ;(wrapper.vm as any).validateAndParseCSV(
      "related_wallet,amount\n0xABC,0"
    )

    expect((wrapper.vm as any).validationError).toBeTruthy()
    expect((wrapper.vm as any).parsedRequests).toEqual([])
  })

  it("keeps the parsed file valid when request creation fails", async () => {
    const wrapper = mountModal()
    const vm = wrapper.vm as any

    vm.validateAndParseCSV("related_wallet,amount\n0xABC,10")
    vm.account.createPaymentRequest = vi
      .fn()
      .mockRejectedValue(new Error("Creation failed"))

    const consoleLog = vi.spyOn(console, "log").mockImplementation(() => {})

    try {
      await expect(vm.createPaymentRequests()).rejects.toBeDefined()
    } finally {
      consoleLog.mockRestore()
    }

    expect(vm.parsedRequests).toHaveLength(1)
    expect(vm.validationError).toBe("")
    expect(vm.submissionError).toBe("Creation failed")
  })
})
