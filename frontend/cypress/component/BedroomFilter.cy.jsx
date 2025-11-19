import React from 'react';
import { MantineProvider } from '@mantine/core';
import BedFilter from '../../src/components/BedFilter.jsx';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';

// wrap cy.mount with MantineProvider
const mountWithMantine = (node) => {
  return cy.mount(
    <MantineProvider withGlobalStyles withNormalizeCSS>
      {node}
    </MantineProvider>,
  );
};

// BedFilter component tests
describe('BedFilter component', () => {
  it('renders initial button text and calls onCommit reset on mount', () => {
    const onCommit = cy.spy().as('onCommit');

    mountWithMantine(
      <BedFilter
        onCommit={onCommit}
        resetBed={0}
        min={1}
        max={5}
      />,
    );

    cy.contains('Choose bedroom number').should('exist');

    cy.get('@onCommit').should('have.been.calledWith', {
      range: null,
      sort: 'none', 
    });
  });

  it('opens popover and shows slider + sort button', () => {
    const onCommit = cy.spy().as('onCommit');

    mountWithMantine(
      <BedFilter
        onCommit={onCommit}
        resetBed={0}
        min={1}
        max={5}
      />,
    );

    cy.contains('Choose bedroom number').click();

    cy.contains('Choose your bedroom number').should('exist');
    cy.contains('Sort: none').should('exist');
  });

  it('cycles sort order and notifies parent via onCommit', () => {
    const onCommit = cy.spy().as('onCommit');

    mountWithMantine(
      <BedFilter
        onCommit={onCommit}
        resetBed={0}
        min={1}
        max={5}
      />,
    );

    //opne popover
    cy.contains('Choose bedroom number').click();

    // none -> asc
    cy.contains('Sort: none').click();
    cy.contains('Sort: Bedroom low → high').should('exist');
    cy.get('@onCommit').its('lastCall.args.0').then((payload) => {
      expect(payload.sort).to.eq('asc');
    });

    // asc -> desc
    cy.contains('Sort: Bedroom low → high').click();
    cy.contains('Sort: Bedroom high → low').should('exist');
    cy.get('@onCommit').its('lastCall.args.0').then((payload) => {
      expect(payload.sort).to.eq('desc');
    });

    // desc -> none
    cy.contains('Sort: Bedroom high → low').click();
    cy.contains('Sort: none').should('exist');
    cy.get('@onCommit').its('lastCall.args.0').then((payload) => {
      expect(payload.sort).to.eq('none');
    });
  });

  it('shows active label after opening (Bedroom Number: …)', () => {
    mountWithMantine(
      <BedFilter
        onCommit={() => {}}
        resetBed={0}
        min={1}
        max={3}
      />,
    );

    cy.contains('Choose bedroom number').click();

    // Move slider to 3
    cy.contains('Bedroom Number: 1–3+').should('exist');
  });
});
