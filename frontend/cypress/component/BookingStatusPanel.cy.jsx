/* eslint-env mocha */
/* global cy */

import React from 'react';
import { MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import BookingStatusPanel from '../../src/components/BookingStatusPanel.jsx';

// wrap cy.mount with MantineProvider
const mountWithMantine = (node) =>
  cy.mount(
    <MantineProvider withGlobalStyles withNormalizeCSS>
      {node}
    </MantineProvider>,
  );

// generate a booking object with defaults
const makeBooking = (id, { owner, listingId, start, end, status } = {}) => ({
  id,
  owner: owner ?? 'user@example.com',
  listingId: listingId ?? 123,
  status: status ?? 'accepted',
  dateRange: {
    start: start ?? '2025-01-01',
    end: end ?? '2025-01-03',
  },
});

// log in the user and stub fetch to return given bookings
const setupLoggedInAndStubBookings = (
  bookings,
  { shouldFail = false, errorMessage = 'Boom error' } = {},
) => {
  cy.window().then((win) => {
    // simulate logged-in user
    win.localStorage.setItem('token', 'FAKE_TOKEN');
    win.localStorage.setItem('email', 'user@example.com');

    const fetchStub = cy.stub(win, 'fetch').as('fetchBookings');

    fetchStub.callsFake((url, options) => {
      //only intercept /bookings API calls
      if (typeof url === 'string' && url.includes('/bookings')) {
        if (shouldFail) {
          return Promise.resolve({
            ok: false,
            json: () =>
              Promise.resolve({
                error: errorMessage,
              }),
          });
        }

        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              bookings,
            }),
        });
      }

      // for other URLs, do a normal fetch
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });
};

describe('BookingStatusPanel component', () => {
  it('shows login prompt when user is not logged in', () => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });

    mountWithMantine(<BookingStatusPanel listingId={123} />);

    cy.contains('Your bookings').should('exist');
    cy.contains('Please login to see your booking status for this listing.')
      .should('exist');
  });

  it('shows "no bookings" message when logged in but there are no bookings', () => {
    setupLoggedInAndStubBookings([]);

    mountWithMantine(<BookingStatusPanel listingId={123} />);

    cy.contains('Your bookings').should('exist');
    cy.contains('You have not booked this listing yet.').should('exist');
  });

  it('renders inline cards when there are 1–2 bookings', () => {
    const bookings = [
      makeBooking(101, {
        listingId: 123,
        start: '2025-01-10',
        end: '2025-01-12',
        status: 'accepted',
      }),
      makeBooking(102, {
        listingId: 123,
        start: '2025-02-01',
        end: '2025-02-03',
        status: 'pending',
      }),
    ];

    setupLoggedInAndStubBookings(bookings);

    mountWithMantine(<BookingStatusPanel listingId={123} />);

    cy.contains('Your bookings').should('exist');

    cy.contains('Booking #101').should('exist');
    cy.contains('Booking #102').should('exist');

    cy.contains('Show details').should('not.exist');
  });

  it('shows popover summary and details when there are more than 2 bookings', () => {
    const bookings = [
      makeBooking(201, {
        listingId: 123,
        start: '2025-03-01',
        end: '2025-03-05',
      }),
      makeBooking(202, {
        listingId: 123,
        start: '2025-04-01',
        end: '2025-04-04',
      }),
      makeBooking(203, {
        listingId: 123,
        start: '2025-05-01',
        end: '2025-05-03',
      }),
      makeBooking(204, {
        listingId: 123,
        start: '2025-06-01',
        end: '2025-06-02',
      }),
    ];

    setupLoggedInAndStubBookings(bookings);

    mountWithMantine(<BookingStatusPanel listingId={123} />);

    cy.contains('Your bookings').should('exist');
    cy.contains('4 bookings').should('exist');

    cy.contains('Show details').should('exist').click();

    cy.contains('Booking #201').should('exist');
    cy.contains('Booking #202').should('exist');
    cy.contains('Booking #203').should('exist');
    cy.contains('Booking #204').should('exist');

    cy.contains('Hide details').should('exist');
  });

  it('shows an error message when the API call fails', () => {
    setupLoggedInAndStubBookings([], {
      shouldFail: true,
      errorMessage: 'Failed to load bookings',
    });

    mountWithMantine(<BookingStatusPanel listingId={123} />);

    cy.contains('Your bookings').should('exist');
    cy.contains('Failed to load bookings').should('exist');
  });
});
