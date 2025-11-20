/* eslint-env mocha */
/* global cy, describe, it, expect */

// Additional Path — Step 1–4
// Guest login → browse listings → view detail page
describe('Additional Path — Guest Login & Browse Listings', () => {
  it('Guest logs in, views listings and enters detail page', () => {
    cy.intercept('POST', '**/user/auth/login', {
      statusCode: 200,
      body: { token: 'guest-token' },
    }).as('login');

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');

    cy.intercept('GET', 'http://localhost:5005/listings', {
      statusCode: 200,
      body: { listings: [{ id: 999 }] },
    }).as('loadAllListings');

    cy.intercept('GET', 'http://localhost:5005/listings/999', {
      statusCode: 200,
      body: {
        listing: {
          id: 999,
          title: 'Nice House',
          address: 'Melbourne',
          price: 180,
          published: true,
          thumbnail:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAiUlEQVR4nGJxXcjFgA0cU2zAKp74YwZW8YVph7CKM2EVpSIYtWDUAsoBI+ePH1glLPalYxWPk/2KVdyp5SVW8aEfRKMWjAALWILtO7BKrO6ejVX8UokwVvG1O3Wwig/9IBq1YARYwKLB+xirhKWfMVbx1Q/mYBV3Ks3BKj70g2jUghFgASAAAP//NXMXvmLZcY0AAAAASUVORK5CYII=',
          metadata: {
            propertyType: 'House',
            bedrooms: 2,
            beds: 2,
            bathrooms: 1,
            amenities: [],
            images: [],
          },
          reviews: [],
          availability: [{ start: '2000-01-01', end: '2100-12-31' }],
        },
      },
    }).as('loadCardInfo');

    cy.visit('http://localhost:3000/login');

    cy.get('input[placeholder="Enter your email"]').type('guest@test.com');
    cy.get('input[placeholder="Enter your password"]').type('guest123');

    cy.get('button[type="submit"]').click();

    cy.wait('@login');
    cy.wait('@loadAllListings');
    cy.wait('@pollBookings');

    cy.url().should('eq', 'http://localhost:3000/');
    cy.contains('Search').should('exist');

    cy.contains('All Listings').click({ force: true });

    cy.wait('@loadAllListings');
    cy.wait('@loadCardInfo');

    cy.contains('Nice House').should('exist');

    cy.contains('Nice House').click();
    cy.url().should('include', '/listings/999');
    cy.wait('@loadCardInfo');

    cy.contains('Nice House').should('exist');
  });
});

// Additional Path — Step 5–6
// Guest booking → accepted → notification appears
describe('Guest booking status update via notifications', () => {
  it('shows acceptance notification', () => {
    // Step A — mock GET /bookings
    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: {
        bookings: [
          {
            id: 777,
            owner: 'guest@test.com',
            listingId: 123,
            status: 'accepted',
            dateRange: { start: '2025-01-10', end: '2025-01-12' },
            totalPrice: 500,
          },
        ],
      },
    }).as('pollBookingsLoop');

    // Step B — mock GET /listings
    cy.intercept('GET', 'http://localhost:5005/listings', {
      statusCode: 200,
      body: { listings: [] },
    }).as('loadAllListings');

    // Step C — visit homepage with initial localStorage
    cy.visit('http://localhost:3000/', {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.localStorage.setItem('token', 'fake-token');
        win.localStorage.setItem('email', 'guest@test.com');

        win.localStorage.setItem(
          'airbrb_prev_guest_bookings_v1',
          JSON.stringify({ 777: 'pending' }),
        );
        win.localStorage.setItem(
          'airbrb_prev_host_bookings_v1',
          JSON.stringify([]),
        );
        win.localStorage.setItem(
          'airbrb_notifications_v1',
          JSON.stringify([]),
        );
      },
    });

    // Step D — wait for the two API calls
    cy.wait('@pollBookingsLoop');
    cy.wait('@loadAllListings');

    // Step E — verify notification text
    cy.contains('Booking accepted', { timeout: 6000 }).should('exist');
    cy.contains('Your booking for listing 123 was accepted.', {
      timeout: 6000,
    }).should('exist');
  });
});

// Logout
describe('User logout flow', () => {
  it('logs out and redirects to login', () => {
    cy.visit('http://localhost:3000/');
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('email', 'guest@test.com');
    });

    cy.contains('Logout').click({ force: true });

    cy.url().should('include', '/login');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('email')).to.be.null;
    });
  });
});
