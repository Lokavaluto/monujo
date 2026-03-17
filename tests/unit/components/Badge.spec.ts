import { describe, it, expect, vi } from "vitest"
import { mount, flushPromises, VueWrapper } from "@vue/test-utils"
import Badge from "@/components/Badge.vue"

interface BadgeProps {
  object: { isBusinessForFinanceBackend?: (() => Promise<boolean>) | boolean }
  toggleRefreshBadge?: boolean
}

describe("Badge.vue", () => {
  it("refreshes when object prop changes", async () => {
    // Initial object: not a business
    const initialObject = {
      isBusinessForFinanceBackend: vi.fn().mockResolvedValue(false),
    }

    const wrapper: VueWrapper<BadgeProps> = mount(Badge, {
      props: { object: initialObject },
    }) as VueWrapper<BadgeProps>

    await flushPromises()

    // Badge should not be visible
    expect(wrapper.find(".badge").exists()).toBe(false)

    // New object: is a business
    const newObject = {
      isBusinessForFinanceBackend: vi.fn().mockResolvedValue(true),
    }

    await wrapper.setProps({ object: newObject })
    await flushPromises()

    // Badge should now be visible - this would fail without the watcher
    expect(wrapper.find(".badge").exists()).toBe(true)
    expect(wrapper.find(".badge").text()).toBe("pro")
  })
})
