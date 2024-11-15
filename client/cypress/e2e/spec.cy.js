describe('Report Download', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5173/');
  });

  it('should display the saved reports list', () => {
    cy.get('.sidebar').should('be.visible');
    cy.get('.saved-reports-list').should('be.visible');
  });

  it('should filter and display reports based on search input', () => {
    const searchTerm = 'example report name'; 
    cy.get('.search-input').type(searchTerm);
    cy.get('.saved-reports-list .saved-report').each(($el) => {
      cy.wrap($el).should('contain.text', searchTerm);
    });
  });

  it('should download a report when the download icon is clicked', () => {
    cy.intercept('GET', '/api/notification/downloadReport/*').as('downloadReport');
    cy.get('.saved-reports-list .saved-report:first .fa-download').click();
    cy.wait('@downloadReport').its('response.statusCode').should('eq', 200);
  });

  it('should print a report when the print icon is clicked', () => {
    cy.intercept('GET', '/api/notification/viewReport/*').as('viewReport');
    cy.get('.saved-reports-list .saved-report:first .fa-print').click();
    cy.wait('@viewReport').its('response.statusCode').should('eq', 200);
  });

  it('should delete a report when the delete icon is clicked', () => {
    cy.intercept('DELETE', '/api/notification/deleteReport/*').as('deleteReport');
    cy.get('.saved-reports-list .saved-report:first .fa-trash').click();
    cy.wait('@deleteReport').its('response.statusCode').should('eq', 200);
    cy.get('.saved-reports-list .saved-report:first').should('not.exist');
  });
});