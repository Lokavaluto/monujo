const email = "vl_part1@0k.io"
const password = "dev"

describe("Login and logout process", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("start page show base interface and login form", () => {
    cy.loginForm().should("be.visible")
    cy.menu().should("be.visible")
  })

  it("login with wrong email triggers error messages", () => {
    cy.login("foo", "wrongpassword")
    cy.loginErrorMessage().should("be.visible")
  })

  it("login with correct credentials succeeds, logout", () => {
    cy.login(email, password)
    cy.isLogged()
    cy.loginForm().should("not.exist")
    cy.logout()
    cy.loginForm().should("exist")
  })
})

describe("Dashboard", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.login(email, password)
  })

  it("show base interface", () => {
    cy.menu().should("be.visible")

    cy.accountsPane().within(() => {
      cy.account().should("be.visible")
    })

    cy.payButton().should("be.visible")
    cy.requestButton().should("be.visible")
    cy.topUpButton().should("be.visible")
  })
})
