/// <reference types="cypress" />
/* eslint-env mocha */
/* global cy, describe, it, beforeEach */

import { MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import BookListingBox from '../../src/components/BookListingBox.jsx';

// wrap cy.mount with MantineProvider
const mountWithMantine = (node) =>
  cy.mount(
    <MantineProvider withGlobalStyles withNormalizeCSS>
      {node}
    </MantineProvider>,
  );

// BookListingBox component tests
describe('BookListingBox component', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('shows login warning card when user is not logged in', () => {
    // make sure logged out
    mountWithMantine(
      <BookListingBox
        price={100}
        listingid={1}
        daterange={[null, null]}
      />,
    );

    cy.contains('Start your trip 🚀').should('exist');
    cy.contains(
      'You are not logged in, so you cannot make a booking.',
    ).should('exist');
    cy.contains('Submit').should('not.exist');
  });

  it('shows base price and empty date labels when logged in but no date selected', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
    });

    mountWithMantine(
      <BookListingBox
        price={100}
        listingid={2}
        daterange={[null, null]}
      />,
    );

    cy.contains('Your total cost: $100 AUD').should('exist');
    cy.contains('for $100 per night').should('exist');

    cy.contains('CHECK-IN')
      .parent()
      .contains('Add date')
      .should('exist');

    cy.contains('CHECK-OUT')
      .parent()
      .contains('Add date')
      .should('exist');

    cy.contains('Submit').should('exist');
    cy.contains('Reset').should('exist');
  });

  it('computes nights and total price from initial date range and can reset back to default', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
    });

    // 2025-01-01 → 2025-01-04 = 3 nights
    const start = new Date(2025, 0, 1);
    const end = new Date(2025, 0, 4);

    mountWithMantine(
      <BookListingBox
        price={150}
        listingid={3}
        daterange={[start, end]}
      />,
    );

    cy.contains('Your total cost: $450 AUD').should('exist');
    cy.contains('for 3 nights · $150/night').should('exist');

    cy.contains('Reset').click();

    cy.contains('Your total cost: $150 AUD').should('exist');
    cy.contains('for $150 per night').should('exist');

    cy.contains('CHECK-IN')
      .parent()
      .contains('Add date')
      .should('exist');

    cy.contains('CHECK-OUT')
      .parent()
      .contains('Add date')
      .should('exist');
  });

  it('opens date picker popover when clicking CHECK-IN button', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
    });

    mountWithMantine(
      <BookListingBox
        price={150}
        listingid={4}
        daterange={[null, null]}
      />,
    );

    cy.contains('Choose date range').should('not.exist');
    cy.contains('CHECK-IN').click();
    cy.contains('Choose date range').should('exist');
    cy.get('button[class*="mantine-DatePicker-day"]').should('exist');
  });
});
