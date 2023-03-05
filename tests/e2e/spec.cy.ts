describe("Login and logout process", () => {
  beforeEach(() => {
    cy.visit("/")
  })

  it("start page show base interface and login form", () => {
    cy.loginForm().should("be.visible")
    cy.menu().should("be.visible")
    cy.loginButton().should("be.visible")
    cy.createAccountButton().should("be.visible")
    if (Cypress.env("screenshot")) cy.takeScreenshot("login")
  })

  it("login with wrong email triggers error messages", () => {
    cy.login("foo", "wrongpassword")
    cy.loginErrorMessage().should("be.visible")
  })

  it("login with correct credentials succeeds, logout", () => {
    cy.login(Cypress.env("email"), Cypress.env("password"))
    cy.isLogged()
    cy.loginForm().should("not.exist")
    cy.logout()
    cy.loginForm().should("exist")
  })
})

describe("General processes when logged in", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.login(Cypress.env("email"), Cypress.env("password"))
  })

  it("show base interface", () => {
    cy.menu().should("be.visible")

    cy.accountsPane().within(() => {
      cy.account().should("be.visible")
    })
    cy.transactionsPane().within(() => {
      cy.transactions().should("be.visible")
    })

    cy.payButton().should("be.visible")
    cy.requestButton().should("be.visible")
    cy.topUpButton().should("be.visible")
    if (Cypress.env("screenshot")) cy.takeScreenshot("dashboard")
  })

  it("Send money process", () => {
    cy.payButton().should("be.visible")
    cy.payButton().click()
    cy.searchBar().within(() => {
      cy.searchInput().should("be.visible")
    })
    cy.searchRecipient("Jesse")
    if (Cypress.env("screenshot")) cy.takeScreenshot("recipients")
    cy.firstSearchedRecipient().click()
    if (Cypress.env("screenshot")) cy.takeScreenshot("pay")
  })

  it("Top-up process", () => {
    cy.topUpButton().should("be.visible")
    cy.topUpButton().click()
    cy.topUpAccount().click()
    if (Cypress.env("screenshot")) cy.takeScreenshot("top-up")
  })
})

describe("Visit public interface", () => {
  beforeEach(() => {
    cy.visit("/")
  })
  it("visit map", () => {
    cy.menu().within(() => {
      // Need to force because in burger menu, it is not seems
      cy.get("#menu-map").click({ force: true })
    })
    cy.frameLoaded()
    if (Cypress.env("screenshot")) cy.takeScreenshot("map")
  })
})
