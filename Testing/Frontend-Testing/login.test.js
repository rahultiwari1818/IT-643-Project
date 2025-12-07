describe('Login Test', () => {
  it('Should login successfully with valid credentials', () => {
    cy.visit('http://localhost:3000');

    cy.get('input[name="email"]').type('testuser@gmail.com');
    cy.get('input[name="password"]').type('Abcd@123');

    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/chat');

    cy.contains("Chats").should("exist");
  });
});
