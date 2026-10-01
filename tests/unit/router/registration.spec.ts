import { describe, expect, it, vi } from "vitest"
import { mkRouter } from "@/router"
import Signup from "@/views/Signup.vue"

vi.mock("@/views/Dashboard.vue", () => ({ default: {} }))
vi.mock("@/views/AdminDashboard.vue", () => ({ default: {} }))
vi.mock("@/views/Carto.vue", () => ({ default: {} }))
vi.mock("@/views/Login.vue", () => ({ default: {} }))
vi.mock("@/views/CreateMyAccount.vue", () => ({ default: {} }))
vi.mock("@/views/Prefs.vue", () => ({ default: {} }))
vi.mock("@/views/ResetPassword.vue", () => ({ default: {} }))
vi.mock("@/views/Signup.vue", () => ({ default: {} }))

describe("registration routes", () => {
  it("allows visitors to access signup while protecting the dashboard", async () => {
    const router = mkRouter(
      "Monujo",
      { getters: { isAuthenticated: false } },
      { $gettext: (text: string) => text }
    )
    try {
      await router.push({ name: "Signup" })
      expect(router.currentRoute.value.path).toBe("/signup")
      expect(router.currentRoute.value.matched[0].components.default).toBe(Signup)
      await router.push({ name: "dashboard" })
      expect(router.currentRoute.value.name).toBe("Carto")
    } finally {
      router.options.history.destroy()
    }
  })
})
