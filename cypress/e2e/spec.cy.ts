// Cypress.Commands.add("login", (username: string, password: string) => {
//   cy.session([username, password], () => {
//     cy.visit("/")
//     cy.get(".login-email").type(username)
//     cy.get(".login-password").type(password)
//     cy.get(".login-button").click()
//     cy.url().should("contain", "/dashboard")
//     cy.get(
//       "#TransactionListRecent  [style*='display: none'].vld-overlay"
//     ).should("exist")
//   })
// })
// Cypress.Commands.add("loadingDashboard", () => {
//   cy.visit("/")
//   cy.get("#TransactionListRecent  [style*='display: none'].vld-overlay").should(
//     "exist"
//   )
// })

describe("screenshoting", () => {
  it("screenshot login page ...", () => {
    cy.viewport(375, 812)
    cy.visit("/")
    cy.get(".login-email").should("exist")
    cy.get(".login-password").should("exist")
    cy.screenshot("dashboard")
  })
})
// describe("screenshot monujo", () => {
//   beforeEach(() => {
//     Cypress.Screenshot.defaults({ capture: "viewport" })
//     cy.viewport(375, 812)
//     cy.login("vl_part1@0k.io", "dev")
//     cy.loadingDashboard()
//   })
//   it("screenshot dashboard", () => {
//     cy.screenshot("test")
//   })
//   it("screenshot send money modal...", () => {
//     //screenshot send money modal
//     cy.get(":nth-child(1) > .button > .icon-text > :nth-child(2)").click()
//     cy.get(
//       ":nth-child(1) > .is-justify-content-flex-start > .recipient-name"
//     ).click()
//     cy.get(".input").clear()
//     cy.get(".input").type("10")
//     cy.screenshot("send-money-amount")
//     cy.get(".modal-card-foot > .button").click()
//     cy.get(".c-toast").click()
//   })

//   it("screenshot credit money modal...", () => {
//     //screenshot credit money modal
//     cy.get(":nth-child(3) > .button > .icon-text > :nth-child(2)").click()
//     cy.get(":nth-child(3) > .account > .custom-inner-card > .is-size-5").click()
//     cy.get(".input").clear()
//     cy.get(".input").type("25")
//     cy.screenshot("credit-money-amount")
//     cy.get(".modal-card-foot > .button").click()
//     cy.get(".delete").click()
//   })

//   it("screenshot export transaction list...", () => {
//     //screenshot export transactions
//     cy.get(".card > .has-text-centered > .button").click()
//     cy.get(".button > .ml-2").click()
//     cy.get(".xmx-input").click()
//     cy.get(":nth-child(2) > :nth-child(3) > .mx-btn").click()
//     cy.get(".xmx-input").click()
//     cy.screenshot("export-transaction-list")
//   })

//   it("screenshot preferences page...", () => {
//     cy.visit("/preferences")
//     cy.get(".navbar-burger > :nth-child(2)").click()
//     cy.get('[href="#/preferences"]').click()
//     cy.screenshot("preferences")
//   })
// })
