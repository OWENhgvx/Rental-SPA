/* eslint-env mocha */
/* global cy */

import React from 'react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import HouseCard from '../../src/components/HouseCard.jsx';

// generate a simple SVG data URL for testing
const makeSvg = (color, label) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
       <rect width="600" height="400" fill="${color}" />
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
             font-size="48" fill="white">${label}</text>
     </svg>`,
  );

const THUMB_IMAGE = makeSvg('#1e90ff', 'HOUSE');

// a basic card info object
const BASE_CARD_INFO = {
  id: 101,
  title: 'Cosy Studio in Sydney',
  propertyType: 'Apartment',
  address: '1 Kensington St, Kensington NSW',
  thumbnail: THUMB_IMAGE,
  price: 150,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  reviewsNum: 12,
  rating: 4.5,
  published: false,
};

// Mantine + React Router wrapper
const mountWithProviders = (node) =>
  cy.mount(
    <MemoryRouter initialEntries={['/']}>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        {node}
      </MantineProvider>
    </MemoryRouter>,
  );

describe('HouseCard component', () => {
  it('renders guest card with image thumbnail and basic info', () => {
    mountWithProviders(
      <HouseCard pageState="guest" cardInfo={BASE_CARD_INFO} />,
    );

    cy.contains('Cosy Studio in Sydney').should('exist');
    cy.contains('Apartment').should('exist');
    cy.contains('1 Kensington St, Kensington NSW').should('exist');

    cy.contains('1 BEDROOM').should('exist');
    cy.contains('1 BED').should('exist');
    cy.contains('1 BATHROOM').should('exist');
    cy.contains('$150/night').should('exist');

    cy.contains('4.50 (12 reviews)').should('exist');

    cy.get('img[alt="House image"]').should('exist');
    cy.get('iframe').should('have.length', 0);
  });

  it('uses YouTube thumbnail as iframe and adds autoplay params on hover', () => {
    const youtubeThumb = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    mountWithProviders(
      <HouseCard
        pageState="guest"
        cardInfo={{ ...BASE_CARD_INFO, thumbnail: youtubeThumb }}
      />,
    );

    const embedBase = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

    cy.get('iframe')
      .should('exist')
      .and('have.attr', 'src')
      .and('eq', embedBase);

    cy.get('img[alt="House image"]').should('have.length', 0);

    cy.get('iframe').trigger('mouseover');

    cy.get('iframe')
      .should('have.attr', 'src')
      .and('include', 'autoplay=1')
      .and('include', 'mute=1');
  });

  it('renders host action icons and calls onDelete when delete is clicked', () => {
    const onDelete = cy.spy().as('onDelete');

    mountWithProviders(
      <HouseCard
        pageState="host"
        cardInfo={{ ...BASE_CARD_INFO, published: false }}
        onDelete={onDelete}
      />,
    );

    cy.get('button[title="Edit"]').should('exist');
    cy.get('button[title="Delete"]').should('exist').click();

    cy.get('@onDelete').should('have.been.calledOnceWith', 101);
  });

  it('shows correct host buttons for published/unpublished states', () => {
    mountWithProviders(
      <HouseCard
        pageState="host"
        cardInfo={{ ...BASE_CARD_INFO, published: false }}
      />,
    );

    cy.contains('Publish').should('exist');
    cy.contains('Unpublish').should('not.exist');
    cy.contains('Edit Dates').should('not.exist');

    mountWithProviders(
      <HouseCard
        pageState="host"
        cardInfo={{ ...BASE_CARD_INFO, id: 202, published: true }}
      />,
    );

    cy.contains('Unpublish').should('exist');
    cy.contains('Edit Dates').should('exist');
  });
});
