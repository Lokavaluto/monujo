const sizes = ["iphone-8", [1024, 768]]
const email = "vl_part1@0k.io"
const password = "dev"
describe("Testing login and logout process ...", () => {
  it("Login page loading main elements", () => {
    cy.visit("/")
    cy.loginLoading()
  })
  it("wrong email triggers error messages", () => {
    cy.loginTriggerErrorMessage("vl_part1@0k.i", password)
  })
  it("Wrong password triggers error messages", () => {
    cy.loginTriggerErrorMessage(email, "toto")
  })
  it("Test login sucess", () => {
    cy.login(email, password)
    cy.url().should("contain", "/dashboard")
  })
  sizes.forEach((size) => {
    it(`Test logout success on viewport ${size}`, () => {
      cy.logout(email, password, size)
    })
  })
})
describe("Testing dashboard...", () => {
  beforeEach(() => {
    cy.login(email, password)
  })
  it("Load dashboard main elements", () => {
    cy.dashboardLoading()
  })
})
