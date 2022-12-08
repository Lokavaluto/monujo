Cypress.Commands.add("login", (username: string, password: string) => {
  cy.visit("/")
  cy.get(".login-email").type(username)
  cy.get(".login-password").type(password)
  cy.get(".login-button").click()
  cy.url().should("contain", "/dashboard")
})
const sizes = ["iphone-8", [1024, 768]]

describe("Testing login and logout process ...", () => {
  it("Login page loading main elements", () => {
    cy.visit("/")
    cy.get(".navbar").should("be.visible")
    cy.get(".card").should("be.visible")
    cy.get(".card > img").should("be.visible")
    cy.get(".login-email").should("be.visible")
    cy.get(".login-button").should("be.visible")
    cy.get(".login-password").should("be.visible")
    cy.get(".navbar-item > img").should("be.visible")
  })
  it("wrong email triggers error messages", () => {
    //cy.viewport(375, 812)
    cy.visit("/")
    cy.get(".login-email").type(" ")
    cy.get(".login-password").type("dev")
    cy.get(".login-button").click()
    cy.get(".has-text-danger").should("be.visible")
  })
  it("Wrong password triggers error messages", () => {
    cy.visit("/")
    cy.get(".login-email").type("vl_part1@0k.io")
    cy.get(".login-password").type(" ")
    cy.get(".login-button").click()
    cy.get(".has-text-danger").should("be.visible")
  })
  it("Test login sucess", () => {
    cy.login("vl_part1@0k.io", "dev")
  })
  sizes.forEach((size) => {
    it(`Test logout sucess on viewport ${size}`, () => {
      cy.login("vl_part1@0k.io", "dev")
      if (Cypress._.isArray(size)) {
        cy.viewport(size[0], size[1])
        cy.get(".navbar-link").click()
        // cy.get(".navbar-dropdown > :last").click()
      } else {
        cy.viewport(size)
        cy.get(".navbar-burger").click()
        cy.get(".navbar-dropdown > :last").click()
      }
      //cy.url().should("eq", Cypress.env("rootUrl"))
    })
  })
})
describe("Testing dashboard...", () => {
  beforeEach(() => {
    cy.login("vl_part1@0k.io", "dev")
  })
  it("Load dashboard main elements", () => {
    cy.get(".is-tablet").children().should("have.length", 2)
    cy.get(".accounts").should("be.visible")
    cy.get(".accounts > .active > .button").should("be.visible")
    cy.get(".action-footer").should("be.visible")
    cy.get(".action-footer > .menu ").children().should("have.length", 3)
    cy.get(".is-recevoir").should("be.visible")
    cy.get(".is-recharger").should("be.visible")
    cy.get(".is-payer").should("be.visible")
  })
})
