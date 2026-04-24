import { beforeEach, describe, expect, it, vi } from "vitest"
import { flushPromises, mount } from "@vue/test-utils"

import ContractListRecent from "@/components/ContractListRecent.vue"
import { getUserAccount } from "@/utils/account"

vi.mock("@/utils/account", () => ({
  getUserAccount: vi.fn(),
}))

vi.mock("@/utils/showSpinner", () => ({
  showSpinnerMethod: () => (fn: Function) => fn,
  replaceWithLoader: vi.fn(),
}))

vi.mock("@/utils/applyDecorators", () => ({
  default: (_decorators: any[], fn: Function) => fn,
}))

function createContracts(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    date: new Date(2026, 0, index + 1),
    id: `contract-${index + 1}`,
  }))
}

function mountList(contracts: any[]) {
  vi.mocked(getUserAccount).mockReturnValue({
    getRecurrentContracts: vi.fn().mockResolvedValue(contracts),
  } as any)

  return mount(ContractListRecent, {
    props: {
      account: { curr: "EUR" },
      refreshToggle: false,
    },
    global: {
      stubs: {
        FoldableSectionCard: {
          template: "<section><slot /></section>",
        },
        TransactionItem: true,
      },
      mocks: {
        $gettext: (message: string) => message,
        $modal: { open: vi.fn() },
      },
    },
  })
}

async function finishLoading(wrapper: ReturnType<typeof mountList>) {
  await flushPromises()
  await wrapper.setData({ hasFinishedFirstLoading: true })
}

describe("ContractListRecent.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("hides the recurring-payment section when there are no contracts", async () => {
    const wrapper = mountList([])

    await finishLoading(wrapper)

    expect(wrapper.find("#the-contract-list").exists()).toBe(false)
  })

  it("hides See more when all contracts fit in the recent list", async () => {
    const wrapper = mountList(createContracts(5))

    await finishLoading(wrapper)

    expect(wrapper.find("#the-contract-list").exists()).toBe(true)
    expect(wrapper.find("button").exists()).toBe(false)
  })

  it("shows See more when there are contracts beyond the recent list", async () => {
    const wrapper = mountList(createContracts(6))

    await finishLoading(wrapper)

    expect(wrapper.find("button").text()).toBe("See more")
  })
})
