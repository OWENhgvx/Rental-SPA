/* eslint-env mocha */
/* global cy */

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
  

// 1. Create Listing Happy Path
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
      cy.get('input[placeholder="Enter YouTube URL"]')
        .type('https://youtu.be/dQw4w9WgXcQ');
  
      // Fill basic fields
      cy.contains('Title').parent().find('input').type('My New House');
      cy.contains('Address').parent().find('input').type('Sydney CBD');
      cy.contains('Price per night').parent().find('input').clear().type('150');
  
      // Select property details
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
  
  
  // 2. Update Listing Thumbnail & Title
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
      cy.get('input[placeholder="Enter YouTube URL"]')
        .clear()
        .type('https://youtu.be/dQw4w9WgXcQ');
  
      // 2. Update title
      cy.contains('Title')
        .parent()
        .find('input')
        .clear()
        .type('Updated House Title');
  
      // 3. Save changes
      cy.contains('Save Changes').click();
  
      // 4. Ensure PUT request is sent and succeeds
      cy.wait('@updateListing')
        .its('response.statusCode')
        .should('eq', 200);
  
      // 5. Polling after navigation
      cy.wait('@pollListings');
      cy.wait('@pollBookings');
  
      // 6. After saving, it should redirect back to host listings
      cy.url().should('include', '/host/listings');
    });
  });
