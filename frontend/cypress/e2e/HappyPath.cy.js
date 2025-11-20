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

// 2. Create Listing Happy Path
describe('Create Listing Happy Path', () => {
  beforeEach(() => {
    // Set fake token in localStorage
    window.localStorage.setItem('token', 'fake-token');

    // Mock polling: GET /listings and GET /bookings
    cy.intercept('GET', '**/listings', {
      statusCode: 200,
      body: { listings: [] },
    }).as('pollListings');

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');
  });

  it('should create a listing successfully', () => {
    cy.visit('http://localhost:3000/host/create-listing');

    // Mock POST /listings/new
    cy.intercept('POST', 'http://localhost:5005/listings/new', {
      statusCode: 200,
      body: { listingId: 999 },
    }).as('createListing');

    // Fill thumbnail as YouTube URL
    cy.get('input[placeholder="Enter YouTube URL"]').type(
      'https://youtu.be/dQw4w9WgXcQ',
    );

    // Fill basic fields
    cy.contains('Title').parent().find('input').type('My New House');
    cy.contains('Address').parent().find('input').type('Sydney CBD');
    cy
      .contains('Price per night')
      .parent()
      .find('input')
      .clear()
      .type('150');

    // Select property details (custom command from commands.js)
    cy.selectOption('Property Type', 'Apartment');
    cy.selectOption('Bedrooms', '2');
    cy.selectOption('Beds', '3');
    cy.selectOption('Bathrooms', '1');

    // Select amenities
    cy.contains('Amenities').click({ force: true });
    cy.get('[role="option"]').contains('Wi-Fi').click({ force: true });
    cy.get('[role="option"]').contains('Parking').click({ force: true });
    cy.get('body').click('topLeft'); // close dropdown

    // Submit
    cy.contains('Create Listing').click();

    cy.wait('@createListing');
    cy.wait('@pollListings');
    cy.wait('@pollBookings');

    // After creating, user should be redirected to host listings page
    cy.url().should('include', '/host/listings');
  });
});

// 3. Update Listing Thumbnail & Title
describe('Update Listing Thumbnail & Title', () => {
  beforeEach(() => {
    // Set fake token/email in localStorage
    window.localStorage.setItem('token', 'fake-token');
    window.localStorage.setItem('email', 'host@test.com');

    // Mock polling after saving
    cy.intercept('GET', '**/listings', {
      statusCode: 200,
      body: { listings: [] },
    }).as('pollListings');

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');

    // Mock GET /listings/123 for edit mode loading
    cy.intercept('GET', 'http://localhost:5005/listings/123', {
      statusCode: 200,
      body: {
        listing: {
          id: 123,
          title: 'Old Title',
          address: 'Old Address',
          price: 100,
          thumbnail: '',
          metadata: {
            propertyType: 'Apartment',
            bedrooms: 1,
            beds: 1,
            bathrooms: 1,
            amenities: [],
            images: [],
          },
          reviews: [],
          availability: [],
        },
      },
    }).as('loadListing');

    // Mock PUT /listings/123 for update
    cy.intercept('PUT', 'http://localhost:5005/listings/123', {
      statusCode: 200,
      body: {},
    }).as('updateListing');
  });

  it('updates the thumbnail and title of the listing successfully', () => {
    // Visit edit page directly
    cy.visit('http://localhost:3000/host/listings/edit/123');

    // Wait for edit page to load existing data
    cy.wait('@loadListing');

    // 1. Update thumbnail via YouTube URL
    cy
      .get('input[placeholder="Enter YouTube URL"]')
      .clear()
      .type('https://youtu.be/dQw4w9WgXcQ');

    // 2. Update title
    cy
      .contains('Title')
      .parent()
      .find('input')
      .clear()
      .type('Updated House Title');

    // 3. Save changes
    cy.contains('Save Changes').click();

    // 4. Ensure PUT request is sent and succeeds
    cy
      .wait('@updateListing')
      .its('response.statusCode')
      .should('eq', 200);

    // 5. Polling after navigation
    cy.wait('@pollListings');
    cy.wait('@pollBookings');

    // 6. After saving, it should redirect back to host listings
    cy.url().should('include', '/host/listings');
  });
});

// 4. Publish a listing successfully (no date selection)
describe('Publish a listing successfully', () => {
  beforeEach(() => {
    // Fake login info in localStorage
    window.localStorage.setItem('token', 'fake-token');
    window.localStorage.setItem('email', 'host@test.com');

    // Mock bookings polling
    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');
  });

  it('should publish a listing successfully without selecting dates', () => {
    // 1. Mock GET /listings so the host has exactly one listing
    cy.intercept('GET', 'http://localhost:5005/listings', {
      statusCode: 200,
      body: {
        listings: [{ id: 123, owner: 'host@test.com' }],
      },
    }).as('loadHostListings');

    // 2. Mock GET /listings/123 (used by HouseCard / GetCardInfo)
    cy.intercept('GET', 'http://localhost:5005/listings/123', {
      statusCode: 200,
      body: {
        listing: {
          id: 123,
          title: 'My House',
          address: 'Sydney',
          price: 150,
          thumbnail:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAiUlEQVR4nGJxXcjFgA0cU2zAKp74YwZW8YVph7CKM2EVpSIYtWDUAsoBI+ePH1glLPalYxWPk/2KVdyp5SVW8aEfRKMWjAALWILtO7BKrO6ejVX8UokwVvG1O3Wwig/9IBq1YARYwKLB+xirhKWfMVbx1Q/mYBV3Ks3BKj70g2jUghFgASAAAP//NXMXvmLZcY0AAAAASUVORK5CYII=',
          published: false,
          metadata: {
            propertyType: 'Apartment',
            bedrooms: 1,
            beds: 1,
            bathrooms: 1,
            amenities: [],
            images: [],
          },
          reviews: [],
          availability: [],
        },
      },
    }).as('loadCardInfo');

    // 3. Visit host listings page
    cy.visit('http://localhost:3000/host/listings');

    cy.wait('@loadHostListings');
    cy.wait('@loadCardInfo');

    // Ensure the listing card is rendered correctly
    cy.contains('My House').should('exist');
    cy.contains('Publish').should('exist');

    // 4. Click Publish → should navigate to Availability page
    cy.contains('Publish').click();
    cy.url().should('include', '/host/listings/123/availability');

    // 5. Mock unpublish + publish APIs on Availability save
    cy.intercept('PUT', '**/listings/unpublish/123', {
      statusCode: 200,
      body: {},
    }).as('unpublish');

    cy.intercept('PUT', '**/listings/publish/123', {
      statusCode: 200,
      body: {},
    }).as('publish');

    // 6. Click "Save & Publish" directly (no date range selection)
    cy.contains('Save & Publish').click({ force: true });

    // Wait for both API calls to be made
    cy.wait('@unpublish');
    cy.wait('@publish');

    // 7. After saving, it should redirect back to host listings
    cy.url().should('include', '/host/listings');
  });
});

// 5. Unpublish a listing successfully
describe('Unpublish a listing successfully', () => {
  let isPublished = true; // track publish state inside the test

  beforeEach(() => {
    // Fake login info in localStorage
    window.localStorage.setItem('token', 'fake-token');
    window.localStorage.setItem('email', 'host@test.com');

    // Mock bookings polling
    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');

    // 1) Mock GET /listings  (host has one listing)
    cy.intercept('GET', 'http://localhost:5005/listings', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          listings: [{ id: 123, owner: 'host@test.com' }],
        },
      });
    }).as('loadHostListings');

    // 2) Mock GET /listings/123, with dynamic `published`
    cy.intercept('GET', 'http://localhost:5005/listings/123', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          listing: {
            id: 123,
            title: 'My House',
            address: 'Sydney',
            price: 150,
            thumbnail:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAiUlEQVR4nGJxXcjFgA0cU2zAKp74YwZW8YVph7CKM2EVpSIYtWDUAsoBI+ePH1glLPalYxWPk/2KVdyp5SVW8aEfRKMWjAALWILtO7BKrO6ejVX8UokwVvG1O3Wwig/9IBq1YARYwKLB+xirhKWfMVbx1Q/mYBV3Ks3BKj70g2jUghFgASAAAP//NXMXvmLZcY0AAAAASUVORK5CYII=',
            published: isPublished,
            metadata: {
              propertyType: 'Apartment',
              bedrooms: 1,
              beds: 1,
              bathrooms: 1,
              amenities: [],
              images: [],
            },
            reviews: [],
            availability: [],
          },
        },
      });
    }).as('loadCardInfo');

    // 3) Mock PUT /listings/unpublish/123
    cy.intercept('PUT', '**/listings/unpublish/123', (req) => {
      // When unpublish succeeds, flip the flag
      isPublished = false;
      req.reply({
        statusCode: 200,
        body: {},
      });
    }).as('unpublish');
  });

  it('should unpublish a listing and toggle button to Publish', () => {
    // 4) Visit host listings page
    cy.visit('http://localhost:3000/host/listings');

    cy.wait('@loadHostListings');
    cy.wait('@loadCardInfo');

    // 5) Ensure listing card shows Unpublish button at first
    cy.contains('My House').should('exist');
    cy.contains('Unpublish').should('exist');

    // 6) Click Unpublish
    cy.contains('Unpublish').click();

    // 7) Ensure unpublish API is called successfully
    cy
      .wait('@unpublish')
      .its('response.statusCode')
      .should('eq', 200);

    // 8) HouseCard refreshes data
    cy.wait('@loadHostListings');
    cy.wait('@loadCardInfo');

    // 9) Now button text should be "Publish"
    cy.contains('Publish').should('exist');

    // 10) Still on host listings page
    cy.url().should('include', '/host/listings');
  });
});

// 6. Make a booking successfully
describe('Make a booking successfully', () => {
  beforeEach(() => {
    window.localStorage.setItem('token', 'fake-token');
    window.localStorage.setItem('email', 'guest@test.com');

    cy.intercept('GET', '**/listings', {
      statusCode: 200,
      body: { listings: [] },
    }).as('pollListings');

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');
  });

  it('should make a booking successfully', () => {
    cy.intercept('GET', 'http://localhost:5005/listings/123', {
      statusCode: 200,
      body: {
        listing: {
          id: 123,
          title: 'Cozy Apartment',
          address: 'Sydney',
          price: 200,
          thumbnail:
            'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAiUlEQVR4nGJxX...II=',
          metadata: {
            propertyType: 'Apartment',
            bedrooms: 2,
            beds: 2,
            bathrooms: 1,
            amenities: ['Wi-Fi'],
            images: [],
          },
          reviews: [],
          availability: [{ start: '2000-01-01', end: '2100-12-31' }],
        },
      },
    }).as('loadListing');

    cy.intercept('POST', '**/bookings/new/123', {
      statusCode: 200,
      body: { bookingId: 789 },
    }).as('sendBooking');

    cy.visit('http://localhost:3000/listings/123');
    cy.wait('@loadListing');

    cy.contains('CHECK-IN').click();
    cy.get('.mantine-Popover-dropdown').should('be.visible');

    cy.get('button[data-direction="next"]').click();

    cy.contains('button', /^25$/).click({ force: true });
    cy.contains('button', /^26$/).click({ force: true });

    cy.get('body').click(0, 0);
    cy.get('.mantine-Popover-dropdown').should('not.be.visible');

    cy.contains('Submit').click({ force: true });

    cy.wait('@sendBooking')
      .its('response.statusCode')
      .should('eq', 200);

    cy.contains(/success/i).should('be.visible');   
    cy.contains(/send success|success/i).should('be.visible');

    cy.contains('OK').click();
    cy.contains(/success/i).should('not.be.visible');
  });
});

// 7. Logs out of the application successfully
describe('Logout Happy Path', () => {
  beforeEach(() => {
    // login first
    window.localStorage.setItem('token', 'fake-token');
    window.localStorage.setItem('email', 'user@test.com');

    // polling mocks
    cy.intercept('GET', '**/listings', {
      statusCode: 200,
      body: { listings: [] },
    }).as('pollListings');

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');
  });

  it('should log out successfully', () => {
    // go dashboard
    cy.visit('http://localhost:3000/');

    // make sure dashboard loaded
    cy.contains('Logout').should('exist');

    // click Logout
    cy.contains('Logout').click();

    // localStorage should be cleared
    cy.wrap(null).then(() => {
      expect(localStorage.getItem('token')).to.be.null;
    });

    // should redirect to login page
    cy.url().should('include', '/login');

    // basic login page check
    cy.contains('Login').should('exist');
  });
});

// 8. Login Happy Path
describe('Login Happy Path', () => {
  it('should log in successfully and redirect to dashboard', () => {
    // Mock POST login request
    cy.intercept('POST', '**/user/auth/login', {
      statusCode: 200,
      body: { token: 'fake-token' },
    }).as('login');

    // Mock dashboard requests
    cy.intercept('GET', '**/listings', {
      statusCode: 200,
      body: { listings: [] },
    }).as('fetchListings');

    cy.intercept('GET', '**/bookings', {
      statusCode: 200,
      body: { bookings: {} },
    }).as('pollBookings');

    // Visit login page
    cy.visit('http://localhost:3000/login');

    // Fill email and password
    cy.get('input[placeholder="Enter your email"]').type('x@test.com');
    cy.get('input[placeholder="Enter your password"]').type('123456');

    // Submit form
    cy.get('button[type="submit"]').click();

    // Wait for POST /user/auth/login to happen
    cy.wait('@login');

    // Should redirect to dashboard
    cy.url().should('eq', 'http://localhost:3000/');

    // Dashboard API calls
    cy.wait('@fetchListings');
    cy.wait('@pollBookings');

    cy.contains('Search').should('exist');
  });
});
