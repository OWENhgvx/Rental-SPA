/* eslint-env mocha */
/* global cy, describe, it, beforeEach, expect */

// 1. Register Happy Path
describe('Register Happy Path', () => {
  it('should register successfully', () => {
    // Visit register page
    cy.visit('http://localhost:3000/register');

    // 1) Mock POST /user/auth/register
    cy.intercept('POST', '**/register', {
      statusCode: 200,
      body: { token: 'fake-token' },
    }).as('register');

    // 2) Mock dashboard APIs after successful register
    cy.intercept('GET', '**/listings', {
      statusCode: 200,
      body: { listings: [] },
    }).as('fetchListings');

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');

    // 3) Fill the form
    cy.get('[data-testid="email"]').type('x@test.com');
    cy.get('[data-testid="name"]').type('tester');
    cy.get('[data-testid="password"]').type('123456');
    cy.get('[data-testid="confirmPassword"]').type('123456');

    // 4) Submit the form
    cy.get('button[type="submit"]').click();

    // 5) Wait for register request
    cy.wait('@register');

    // 6) Should be redirected to dashboard
    cy.url().should('eq', 'http://localhost:3000/');

    // 7) Wait for dashboard APIs
    cy.wait('@fetchListings');
    cy.wait('@pollBookings');

    // 8) Basic dashboard UI check
    cy.contains('Search').should('exist');
  });
});
