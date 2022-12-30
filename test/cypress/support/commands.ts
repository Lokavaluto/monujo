Cypress.Commands.add("login", (username: string, password: string) => {
  cy.visit("/")
  cy.get(".mb-5 > .control > .input").type(username)
  cy.get(".mb-2 > .control > .input").type(password)
  cy.get(":nth-child(1) > .control > .button").click()
})

Cypress.Commands.add("dashboardLoading", () => {
  cy.get(".is-tablet").children().should("have.length", 2)
  cy.get(".accounts").should("be.visible")
  cy.get(".accounts > .active > .button").should("be.visible")
  cy.get(".action-footer").should("be.visible")
  cy.get(".action-footer > .menu ").children().should("have.length", 3)
  cy.get(".is-recevoir").should("be.visible")
  cy.get(".is-recharger").should("be.visible")
  cy.get(".is-payer").should("be.visible")
})

Cypress.Commands.add("loginLoading", () => {
  cy.get(".navbar").should("be.visible")
  cy.get(".card").should("be.visible")
  cy.get(".card > img").should("be.visible")
  cy.get(".mb-5 > .control > .input").should("be.visible")
  cy.get(":nth-child(1) > .control > .button").should("be.visible")
  cy.get(".mb-2 > .control > .input").should("be.visible")
  cy.get(".navbar-item > img").should("be.visible")
})

Cypress.Commands.add(
  "loginTriggerErrorMessage",
  (username: string, password: string) => {
    cy.login(username, password)
    cy.get(".has-text-danger").should("be.visible")
    cy.get(".has-text-danger").should("be.visible")
  }
)

Cypress.Commands.add(
  "logout",
  (username: string, password: string, viewPortSize: string | []) => {
    cy.login(username, password)
    if (Cypress._.isArray(viewPortSize)) {
      cy.viewport(viewPortSize[0], viewPortSize[1])
      cy.get(".navbar-link").click()
    } else {
      cy.viewport(viewPortSize)
      cy.get(".navbar-burger").click()
      cy.get(".navbar-dropdown > :last").click()
    }
  }
)
