/* eslint-env mocha */
/* global cy */

import React from 'react';
import { MantineProvider } from '@mantine/core';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

import ListingImageDisplay from '../../src/components/ListingImageDisplay.jsx';

// genberate simple colored SVG data URLs for testing
const makeSvg = (color, label) =>
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">
       <rect width="600" height="400" fill="${color}" />
       <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
             font-size="48" fill="white">${label}</text>
     </svg>`,
  );

const IMG_COVER = makeSvg('#f59e0b', 'COVER');
const IMG1 = makeSvg('#ff6b6b', 'Slide 1');
const IMG2 = makeSvg('#1e90ff', 'Slide 2');
const IMG3 = makeSvg('#2ecc71', 'Slide 3');

const mountWithMantine = (node) => {
  return cy.mount(
    <MantineProvider withGlobalStyles withNormalizeCSS>
      {node}
    </MantineProvider>,
  );
};

describe('ListingImageDisplay component', () => {
  it('renders a single image slide when given a string URL', () => {
    mountWithMantine(<ListingImageDisplay images={IMG_COVER} />);

    cy.get('img')
      .first()
      .should('have.attr', 'src', IMG_COVER);

    cy.get('button[class*="mantine-ActionIcon-root"]').should('have.length', 0);
  });

  it('renders an iframe for a YouTube watch URL', () => {
    const watchUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const expectedEmbed = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

    mountWithMantine(<ListingImageDisplay images={watchUrl} />);

    cy.get('img').should('have.length', 0);
    cy.get('iframe')
      .should('exist')
      .and('have.attr', 'src')
      .and('include', expectedEmbed);
  });

  it('supports first slide as YouTube short link and second slide as image', () => {
    const videoShortUrl =
      'https://youtu.be/dQw4w9WgXcQ?list=RDdQw4w9WgXcQ';
    const expectedEmbed = 'https://www.youtube.com/embed/dQw4w9WgXcQ';

    mountWithMantine(
      <ListingImageDisplay images={[videoShortUrl, IMG_COVER]} />,
    );

    cy.get('iframe')
      .should('exist')
      .and('have.attr', 'src')
      .and('include', expectedEmbed);
    cy.get('img').should('have.length', 0);

    cy.get('button[class*="mantine-ActionIcon-root"]').should('have.length', 2);

    const rightArrow = () =>
      cy.get('button[class*="mantine-ActionIcon-root"]').eq(1);

    rightArrow().click();

    cy.get('iframe').should('have.length', 0);
    cy.get('img')
      .first()
      .should('have.attr', 'src', IMG_COVER);
  });

  it('cycles through multiple image slides with left and right arrows', () => {
    const urls = [IMG1, IMG2, IMG3];

    mountWithMantine(<ListingImageDisplay images={urls} />);

    cy.get('img')
      .first()
      .should('have.attr', 'src', IMG1);

    cy.get('button[class*="mantine-ActionIcon-root"]').should('have.length', 2);

    const leftArrow = () =>
      cy.get('button[class*="mantine-ActionIcon-root"]').eq(0);
    const rightArrow = () =>
      cy.get('button[class*="mantine-ActionIcon-root"]').eq(1);

    rightArrow().click();
    cy.get('img')
      .first()
      .should('have.attr', 'src', IMG2);

    rightArrow().click();
    cy.get('img')
      .first()
      .should('have.attr', 'src', IMG3);

    rightArrow().click();
    cy.get('img')
      .first()
      .should('have.attr', 'src', IMG1);

    leftArrow().click();
    cy.get('img')
      .first()
      .should('have.attr', 'src', IMG3);
  });
});
