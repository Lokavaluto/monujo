import "cypress-iframe"
import "./commands"

Cypress.on("uncaught:exception", (err, runnable) => {
  // returning false here prevents Cypress from
  // failing the test
  return false
})

Cypress.Screenshot.defaults({ capture: "fullPage", overwrite: true })
