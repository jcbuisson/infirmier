
describe('Example Test', () => {
   it('Visits the app root url', () => {
      cy.visit('/')
      cy.contains('Journal de')
   })
})
