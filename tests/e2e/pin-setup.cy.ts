// Enabling the simplified authentication (PIN code) asks for the
// wallet password, which is checked by unlocking the wallet of each
// account listed in the preferences.  This must work whether or not
// the dashboard had a chance to load the account balances first.
//
// Requires an account owning a Comchain wallet with no PIN code
// configured yet on this browser, its login given through the
// ``email`` and ``password`` env values, and its wallet password
// through ``walletPassword``, for instance:
//
//     npx cypress run --spec tests/e2e/pin-setup.cy.ts \
//         --env walletPassword=secret

function goToPreferences() {
  cy.window().then((win) => {
    win.location.hash = "#/preferences"
  })
  cy.get("#simplified-auth", { timeout: 20000 }).should("exist")
}

// The wallet can only be decrypted once a Comchain server was
// selected, which the account balances loading triggers in the
// background.  Holding back the server health check makes sure the
// password gets submitted before that selection is done, instead of
// depending on how fast the Comchain servers answer.
function delayComchainServerSelection() {
  cy.intercept({ url: /\/dbcheck\.php/ }, (req) => {
    req.on("response", (res) => {
      res.setDelay(5000)
    })
  })
}

function enableSimplifiedAuth() {
  cy.get("#simplified-auth label.switch", { timeout: 20000 }).first().click()
  cy.get(".modal input[type=password]", { timeout: 10000 })
    .first()
    .type(Cypress.env("walletPassword"), { log: false })
  cy.get(".modal button.is-primary").first().click()
}

function shouldAcceptWalletPassword() {
  cy.get(".edit-pin", { timeout: 20000 }).should("be.visible")
  cy.get(".failed-unlock").should("not.exist")
}

describe("PIN code setup", () => {
  before(function () {
    if (
      !Cypress.env("email") ||
      !Cypress.env("password") ||
      !Cypress.env("walletPassword")
    ) {
      this.skip()
    }
  })

  beforeEach(() => {
    cy.visit("/")
    cy.login(Cypress.env("email"), Cypress.env("password"))
    cy.isLogged()
  })

  it("accepts the wallet password right after login", () => {
    goToPreferences()
    enableSimplifiedAuth()
    shouldAcceptWalletPassword()
  })

  it("accepts the wallet password when the app starts on preferences", () => {
    goToPreferences()
    delayComchainServerSelection()
    cy.reload()
    enableSimplifiedAuth()
    shouldAcceptWalletPassword()
  })
})
