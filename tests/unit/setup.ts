/**
 * Vitest setup file
 * Provides global mocks for Vue components testing
 */
import { vi } from "vitest"
import { config } from "@vue/test-utils"

// Mock FontAwesome component globally
config.global.stubs = {
  "fa-icon": {
    template: '<span class="fa-icon-stub"><slot /></span>',
  },
}

// Mock vue-loading-overlay
vi.mock("vue-loading-overlay", () => ({
  default: {
    template: '<div class="loading-stub"><slot /></div>',
    props: ["active"],
  },
}))
