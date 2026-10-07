// The Cyclos session token is only sent by Odoo in the login response
// (``/auth/authenticate``), never by ``/partner/backend_credentials``.
// These scenarios check that Monujo keeps it long enough for the
// Cyclos account to load, and across a page reload.
//
// Requires an account owning a Cyclos wallet, given through the
// ``cyclosEmail`` and ``cyclosPassword`` env values, for instance:
//
//     npx cypress run --spec tests/e2e/cyclos-token.cy.ts \
//         --env cyclosEmail=me@example.com,cyclosPassword=secret

const backendCredentialsUrl = "**/partner/backend_credentials"

function loginWithCyclosAccount() {
  cy.visit("/")
  cy.login(Cypress.env("cyclosEmail"), Cypress.env("cyclosPassword"))
  cy.isLogged()
}

function cyclosAccount() {
  return cy.contains(".account-backend", "cyclos", { timeout: 20000 })
}

describe("Cyclos session token", () => {
  before(function () {
    if (!Cypress.env("cyclosEmail") || !Cypress.env("cyclosPassword")) {
      this.skip()
    }
  })

  it("loads the Cyclos account right after login", () => {
    loginWithCyclosAccount()
    cyclosAccount().should("be.visible")
  })

  it("does not fetch backend credentials again right after login", () => {
    cy.intercept("POST", backendCredentialsUrl).as("backendCredentials")
    loginWithCyclosAccount()
    cyclosAccount().should("be.visible")
    cy.get("@backendCredentials.all").should("have.length", 0)
  })

  it("loads the Cyclos account after a page reload", () => {
    loginWithCyclosAccount()
    cyclosAccount().should("be.visible")
    cy.reload()
    cy.isLogged()
    cyclosAccount().should("be.visible")
  })

  it("loads the Cyclos account after a manual refresh", () => {
    loginWithCyclosAccount()
    cyclosAccount().should("be.visible")
    cy.intercept("POST", backendCredentialsUrl).as("backendCredentials")
    cy.refreshButton().first().click()
    cy.wait("@backendCredentials")
    cyclosAccount().should("be.visible")
  })
})
