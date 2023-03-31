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
    cy.refreshButton().should("be.visible")
    if (Cypress.env("screenshot")) cy.takeScreenshot("dashboard")
  })

  it("Send money process", () => {
    cy.payButton().should("be.visible")
    cy.payButton().click()
    cy.modal().should("be.visible")
    cy.searchBar().within(() => {
      cy.searchInput().should("be.visible")
    })
    cy.searchRecipient("Jesse")
    if (Cypress.env("screenshot")) cy.takeScreenshot("recipients")
    cy.firstSearchedRecipient().click()
    if (Cypress.env("screenshot")) cy.takeScreenshot("pay")

    // send empty or wrong amount
    cy.sendMoneyButton().should("be.visible")
    cy.sendMoneyButton().click()
    cy.errorMessage().should("be.visible")
    cy.amountSendInput().should("be.visible")
    cy.amountSendInput().type("wrong amount")
    cy.errorMessage().should("be.visible")

    // close modal
    cy.closeModal()
    cy.modal().should("not.exist")
  })

  it("Top-up process", () => {
    cy.topUpButton().should("be.visible")
    cy.topUpButton().click()
    cy.topUpAccount().click()
    cy.topUpNextButton().should("be.visible")
    cy.topUpNextButton().should("be.disabled")
    if (Cypress.env("screenshot")) cy.takeScreenshot("top-up")

    // top-up empty or invalid amount
    cy.amountInput().should("be.visible")
    cy.amountInput().type("test invalid amount")
    cy.topUpNextButton().should("be.disabled")

    // close top-up modal
    cy.closeModal()
    cy.modal().should("not.exist")
  })
})

describe("Preferences page", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.login(Cypress.env("email"), Cypress.env("password"))
  })
  it("show base interface", () => {
    cy.openPreferencesPage()
    cy.menu().should("be.visible")
    cy.preferencesCard().should("be.visible")
    cy.preferencesCard().within(() => {
      cy.preferencesGroups().should("be.visible")
      cy.simplifiedAuthPref().should("be.visible")
      cy.simplifiedAuthPref().within(() => {
        cy.getSwitch().click()
      })
    })
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

describe("Signup process", () => {
  beforeEach(() => {
    cy.visit("/")
    cy.clickSignupButton()
  })
  it("Signup page show form", () => {
    cy.url().should("include", "signup")
    cy.getSignupForm().should("be.visible")
    cy.getButtonSubmit().should("be.visible")
  })
  it("Signup with already existing email", () => {
    cy.getSignupForm().within(() => {
      cy.getEmailInput().type("vl_part1@0k.io")
      cy.getFirstNameInput().type("FirstName")
      cy.getLastNameInput().type("LastName")
      cy.getPasswordInput().type("dev")
      cy.getConfirmPasswordInput().type("dev")
      cy.getButtonSubmit().click()
      cy.getSignupSubmitError().should("be.visible")
    })
  })
})
