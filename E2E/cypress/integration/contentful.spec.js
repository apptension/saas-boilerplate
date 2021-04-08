import BASIC_AUTH from '../fixtures/basicAuth';
import {
  addToFavorites,
  expectItemNotToBeFavorite,
  expectItemToBeFavorite,
  getContentfulItemUrl,
  previewContentfulItem,
  removeFromFavorites,
  removeFromFavoritesWithApi,
} from '../support/contentful';
import { URL_REGEX } from '../support/gmailApi/gmail.api.constants';

describe('Contentful integration', () => {
  const userEmail = Cypress.env('EMAIL');
  const password = Cypress.env('PASSWORD');

  beforeEach(() => {
    cy.getJWTtoken(userEmail, password);
    removeFromFavoritesWithApi();
    cy.visit('/en/demo-items', BASIC_AUTH);
  });

  it('should see Contentful items on the list', () => {
    cy.contains('Contentful items').should('be.visible');

    cy.get('li button')
      .should('be.visible')
      .invoke('attr', 'aria-checked')
      .should('equal', 'false');

    cy.get('li img').should('be.visible').invoke('attr', 'src').should('match', URL_REGEX);

    cy.get('li p').should('be.visible').invoke('text').its('length').should('be.greaterThan', 0);
  });

  it('should add item to favorites', () => {
    addToFavorites();
    expectItemToBeFavorite();
  });

  it('should remove item from favorites', () => {
    addToFavorites();
    removeFromFavorites();

    expectItemNotToBeFavorite();
  });

  it('should see the full content of Contentful item', () => {
    getContentfulItemUrl().then((url) => {
      previewContentfulItem();

      cy.url().should('include', url);

      ['h1', 'p'].forEach((elem) =>
        cy.get(elem).should('be.visible').invoke('text').its('length').should('be.greaterThan', 0)
      );

      cy.get('img').should('be.visible').invoke('attr', 'src').should('match', URL_REGEX);

      cy.contains('Go back').click();

      expectItemNotToBeFavorite();
    });
  });
});
