/// <reference types="cypress" />
/* eslint-env mocha */
/* global cy, describe, it, beforeEach */

import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { MemoryRouter } from 'react-router-dom';

import CommentBar from '../../src/components/CommentBar.jsx';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

// Mantine + React Router wrapper
const mountWithProviders = (node) =>
  cy.mount(
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Notifications />
      <MemoryRouter>
        {node}
      </MemoryRouter>
    </MantineProvider>,
  );

describe('CommentBar component', () => {
  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('shows login prompt when user is not logged in', () => {
    mountWithProviders(<CommentBar listingId={123} />);

    cy.contains('Leave a review').should('exist');
    cy.contains(
      'Please login to view your bookings and leave a review for this listing.',
    ).should('exist');
    cy.contains('Go to login').should('exist');
  });

  it('shows message when logged in but there are no accepted bookings', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('email', 'test@example.com');
    });

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: {
        bookings: [],
      },
    }).as('getBookings');

    mountWithProviders(<CommentBar listingId={456} />);

    cy.wait('@getBookings');

    cy.contains('Leave a review').should('exist');
    cy.contains(
      'You have not completed any accepted booking for this listing yet,',
    ).should('exist');
    cy.contains('so you cannot leave a review.').should('exist');
  });

  it('shows review form when there are bookings and updates character counter', () => {
    // simulate logged in
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-token');
      win.localStorage.setItem('email', 'test@example.com');
    });

    // stub bookings API to return one accepted booking
    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: {
        bookings: [
          {
            id: 42,
            owner: 'test@example.com',
            listingId: 999,
            status: 'accepted',
            dateRange: {
              start: '2025-01-01',
              end: '2025-01-03',
            },
          },
        ],
      },
    }).as('getBookings');

    mountWithProviders(<CommentBar listingId={999} />);

    cy.wait('@getBookings');

    // render form elements
    cy.contains('Leave a review').should('exist');
    cy.contains('Which booking?').should('exist');
    cy.contains('Score').should('exist');
    cy.contains('Your comment').should('exist');
    cy.contains('Booking #42').should('exist');

    cy.contains('0/500').should('exist');

    // type into textarea and check character counter
    cy.contains('Your comment')
      .parent()
      .find('textarea')
      .type('Nice stay!');

    cy.contains('10/500').should('exist');
  });
});
