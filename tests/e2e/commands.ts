export {}

Cypress.Commands.add("login", (username: string, password: string) => {
  cy.loginForm().within(() => {
    cy.get("input").first().type(username)
    cy.get('input[type="password"]').type(password)
    cy.get("button[type='submit']").click()
  })
})

Cypress.Commands.add("loginForm", () => {
  return cy.get("section#login form")
})

Cypress.Commands.add("accountsPane", () => {
  return cy.get(".accounts")
})

Cypress.Commands.add("account", () => {
  return cy.get(".account")
})

Cypress.Commands.add("transactionsPane", () => {
  return cy.get(".mt-5 > .columns > :nth-child(2)")
})

Cypress.Commands.add("transactions", () => {
  return cy.get("#the-transaction-list")
})

Cypress.Commands.add("payButton", () => {
  return cy.get(".is-pay")
})

Cypress.Commands.add("requestButton", () => {
  return cy.get(".is-request")
})

Cypress.Commands.add("topUpButton", () => {
  return cy.get(".is-top-up")
})

Cypress.Commands.add("menu", () => {
  return cy.get("#app > nav.navbar")
})

Cypress.Commands.add("refreshButton", () => {
  return cy.get(".refresh")
})

Cypress.Commands.add("isLogged", () => {
  cy.get(".action-footer:visible")
})

Cypress.Commands.add("loginErrorMessage", () => {
  return cy.get(".has-text-danger")
})

Cypress.Commands.add("logout", () => {
  cy.isLogged() // Wait for element
  cy.get(".navbar-link:visible")
    .should((_) => {}) // Ignore assertion
    .then(($element) => {
      if ($element.length > 0) {
        $element.click()
        cy.menu().within(() => {
          // cypress can't hover. The dropdown can't be opened.
          // we need to use the ``{ force: true }`` to click on
          // invisible elements.
          cy.get(".navbar-dropdown .navbar-item")
            .get("#menu-signout")
            .click({ force: true })
        })
      } else {
        cy.get(".navbar-burger").click()
        cy.get(".navbar-dropdown > :last").click()
      }
    })
})
Cypress.Commands.add("searchBar", () => {
  return cy.get("p.custom-search-bar")
})
Cypress.Commands.add("firstSearchedRecipient", () => {
  return cy.get(".custom-card > :nth-child(1) >> .recipient-name")
})
Cypress.Commands.add("searchInput", () => {
  return cy.get("input")
})
Cypress.Commands.add("sendMoneyButton", () => {
  return cy.get("#send-money-button")
})
Cypress.Commands.add("errorMessage", () => {
  return cy.get(".notification.is-danger")
})
Cypress.Commands.add("amountSendInput", () => {
  return cy.get("#send-amount-input")
})

Cypress.Commands.add("topUpAccount", () => {
  return cy.get("div.custom-amount-input").find("div.account-selector").first()
})
Cypress.Commands.add("topUpNextButton", () => {
  return cy.get("#top-up-button")
})
Cypress.Commands.add("amountInput", () => {
  return cy.get(".custom-amount-input").find(".input")
})
Cypress.Commands.add("loginButton", () => {
  return cy.get("p > .is-login")
})
Cypress.Commands.add("createAccountButton", () => {
  return cy.get("p > .create-account")
})
Cypress.Commands.add("searchRecipient", (recipient: string) => {
  cy.searchInput().type(recipient)
  cy.firstSearchedRecipient().should("be.visible")
  cy.firstSearchedRecipient().contains(recipient)
  return cy.firstSearchedRecipient()
})
Cypress.Commands.add("takeScreenshot", (title: string) => {
  // There were some occurrence were text was not yet loaded
  // in elements and screenshot was done to early.
  cy.wait(2000)
  cy.screenshot(title, {
    clip: {
      x: 0,
      y: 0,
      width: Cypress.config("viewportWidth"),
      height: Cypress.config("viewportHeight"),
    },
  })
})
Cypress.Commands.add("openPreferencesPage", () => {
  cy.isLogged()
  cy.get(".navbar-link:visible")
    .should((_) => {}) // Ignore assertion
    .then(($element) => {
      if ($element.length > 0) {
        $element.click()
        cy.menu().within(() => {
          // cypress can't hover. The dropdown can't be opened.
          // we need to use the ``{ force: true }`` to click on
          // invisible elements.
          cy.get(".navbar-dropdown .navbar-item")
            .get("#menu-preferences")
            .click({ force: true })
        })
      } else {
        cy.get(".navbar-burger").click()
        cy.get(".navbar-dropdown > #menu-preferences").click()
      }
    })
})
Cypress.Commands.add("preferencesCard", () => {
  return cy.get(".custom-card-prefs")
})
Cypress.Commands.add("preferencesGroups", () => {
  return cy.get(".prefs-group")
})
Cypress.Commands.add("simplifiedAuthPref", () => {
  return cy.get("#simplified-auth")
})
Cypress.Commands.add("getSwitch", () => {
  return cy.get(".switch > .slider")
})
Cypress.Commands.add("modal", () => {
  return cy.get(".modal")
})
Cypress.Commands.add("closeModal", () => {
  cy.modal().within(() => {
    cy.get(".modal-card-head").find(".delete").click()
  })
})
Cypress.Commands.add("isSignupVisible", () => {
  cy.get(".create-account").then(($element) => {
    return $element.length > 0
  })
})
Cypress.Commands.add("clickSignupButton", () => {
  if (cy.isSignupVisible()) {
    cy.get(".create-account").click()
  }
})
Cypress.Commands.add("getSignupForm", () => {
  return cy.get("form")
})
Cypress.Commands.add("getConfirmPasswordInput", () => {
  return cy.get("#confirm-password")
})
Cypress.Commands.add("getPasswordInput", () => {
  return cy.get("#password")
})
Cypress.Commands.add("getLastNameInput", () => {
  return cy.get("#last-name")
})
Cypress.Commands.add("getFirstNameInput", () => {
  return cy.get("#first-name")
})
Cypress.Commands.add("getEmailInput", () => {
  return cy.get("#email")
})
Cypress.Commands.add("getButtonSubmit", () => {
  return cy.get("button[type='submit']")
})
Cypress.Commands.add("getSignupSubmitError", () => {
  return cy.get(".has-text-danger")
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<JQuery<HTMLElement>>
      dashboardLoading(): void
      menu(): Chainable<JQuery<HTMLElement>>
      loginForm(): Chainable<JQuery<HTMLElement>>
      isLogged(): void
      loginErrorMessage(): Chainable<JQuery<HTMLElement>>
      logout(): void
      accountsPane(): Chainable<JQuery<HTMLElement>>
      account(): Chainable<JQuery<HTMLElement>>
      payButton(): Chainable<JQuery<HTMLElement>>
      requestButton(): Chainable<JQuery<HTMLElement>>
      topUpButton(): Chainable<JQuery<HTMLElement>>
      transactionsPane(): Chainable<JQuery<HTMLElement>>
      transactions(): Chainable<JQuery<HTMLElement>>
      searchBar(): Chainable<JQuery<HTMLElement>>
      searchInput(): Chainable<JQuery<HTMLElement>>
      sendMoneyButton(): Chainable<JQuery<HTMLElement>>
      errorMessage(): Chainable<JQuery<HTMLElement>>
      amountSendInput(): Chainable<JQuery<HTMLElement>>
      firstSearchedRecipient(): Chainable<JQuery<HTMLElement>>
      searchRecipient(recipient: string): Chainable<JQuery<HTMLElement>>
      topUpAccount(): Chainable<JQuery<HTMLElement>>
      topUpNextButton(): Chainable<JQuery<HTMLElement>>
      amountInput(): Chainable<JQuery<HTMLElement>>
      createAccountButton(): Chainable<JQuery<HTMLElement>>
      loginButton(): Chainable<JQuery<HTMLElement>>
      takeScreenshot(title: string): void
      openPreferencesPage(): void
      refreshButton(): Chainable<JQuery<HTMLElement>>
      preferencesCard(): Chainable<JQuery<HTMLElement>>
      preferencesGroups(): Chainable<JQuery<HTMLElement>>
      simplifiedAuthPref(): Chainable<JQuery<HTMLElement>>
      getSwitch(): Chainable<JQuery<HTMLElement>>
      modal(): Chainable<JQuery<HTMLElement>>
      closeModal(): void
      isSignupVisible(): boolean
      clickSignupButton(): void
      getSignupForm(): Chainable<JQuery<HTMLElement>>
      getEmailInput(): Chainable<JQuery<HTMLElement>>
      getFirstNameInput(): Chainable<JQuery<HTMLElement>>
      getLastNameInput(): Chainable<JQuery<HTMLElement>>
      getPasswordInput(): Chainable<JQuery<HTMLElement>>
      getConfirmPasswordInput(): Chainable<JQuery<HTMLElement>>
      getButtonSubmit(): Chainable<JQuery<HTMLElement>>
      getSignupSubmitError(): Chainable<JQuery<HTMLElement>>
    }
  }
}
