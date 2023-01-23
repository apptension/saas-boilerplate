import { getToken } from './authentication';

export const waitForFavoritesToLoad = () => {
  cy.intercept('api/demo/contentful-item-favorite/').as('getFavoriteItems');
  cy.wait('@getFavoriteItems');
};

export const addToFavorites = () => {
  cy.intercept('POST', '/api/demo/contentful-item/*/favorite/').as('addToFavorites');

  cy.get('li button[role=checkbox]').first().click();
  cy.wait('@addToFavorites');
};

export const removeFromFavorites = () => {
  cy.intercept('DELETE', '/api/demo/contentful-item/*/favorite/').as('removeFromFavorites');

  cy.get('li button[role=checkbox]').first().click();
  cy.wait('@removeFromFavorites');
};

export const getContentfulItemUrl = () => {
  return cy.get('li a').first().invoke('attr', 'href');
};

export const previewContentfulItem = () => {
  cy.get('li a').first().click();
};

const getFavoriteItems = () =>
  cy.request({
    url: 'api/demo/contentful-item-favorite/',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

export const getContentfulItems = () =>
  cy.request({
    method: 'POST',
    url: `https://graphql.contentful.com/content/v1/spaces/${Cypress.env(
      'CONTENTFUL_SPACE_ID'
    )}/environments/develop?access_token=${Cypress.env('CONTENTFUL_ACCESS_TOKEN')}`,
    body: {
      operationName: 'allDemoItems',
      query:
        'query allDemoItems {demoItemCollection {items {sys {id __typename}title image {title url __typename} __typename} __typename}}',
    },
  });

export const addToFavoritesWithApi = () => {
  getContentfulItems().then((res) => {
    const { items } = res.body.data.demoItemCollection;

    cy.request({
      method: 'POST',
      url: `/api/demo/contentful-item/${items[0].sys.id}/favorite/`,
    });
  });
};

export const removeFromFavoritesWithApi = () => {
  getFavoriteItems().then((items) => {
    if (items.body.length > 0) {
      items.body.forEach((item) => {
        cy.request({
          method: 'DELETE',
          url: `/api/demo/contentful-item/${item.item}/favorite/`,
        });
      });
    }
  });
};

export const expectItemToBeFavorite = () => {
  cy.get('li button[role=checkbox]').first().should('have.attr', 'aria-checked', 'true');
  cy.reload();
  waitForFavoritesToLoad();
  cy.get('li button[role=checkbox]').first().should('have.attr', 'aria-checked', 'true');
};

export const expectItemNotToBeFavorite = () => {
  cy.get('li button[role=checkbox]').first().should('have.attr', 'aria-checked', 'false');
  cy.reload();
  waitForFavoritesToLoad();
  cy.get('li button[role=checkbox]').first().should('have.attr', 'aria-checked', 'false');
};
