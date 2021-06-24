import BASIC_AUTH from '../fixtures/basicAuth';
import CRUD_DATA from '../fixtures/crudData';
import { CHANGES_SAVED_SNACKBAR_TEXT } from '../support/assertion';
import {
  addCrudItem,
  createCrudWithApi,
  deleteCrudItem,
  deleteTestCrudItems,
  editCrudItem,
  expectCrudToBeCreated,
  expectCrudToBeDeleted,
  expectCrudToBeDisplayed,
  getCrudSelector,
} from '../support/crud';
import {
  expectErrorTextToBeDisplayed,
  expectRequestNotToHappen,
  expectSnackbarToBeDisplayed,
} from '../support/helpers';

const userEmail = Cypress.env('EMAIL');
const password = Cypress.env('PASSWORD');
const name = 'E2E CRUD item - created';
const newName = 'E2E CRUD item - edited';

describe('CRUD', () => {
  before(() => {
    cy.getJWTtoken(userEmail, password);
    deleteTestCrudItems([name, newName]);
  });

  beforeEach(() => {
    cy.getJWTtoken(userEmail, password);
    cy.visit('/en/crud-demo-item/', BASIC_AUTH);
  });

  it('should create CRUD item', () => {
    cy.intercept('POST', '/api/graphql/').as('crudCreated');

    addCrudItem(name);
    cy.intercept('GET', '/api/graphql/').as('getCrud');
    expectCrudToBeCreated(name, '@crudCreated', '@getCrud');
  });

  it('should preview CRUD item', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;

      cy.reload();
      cy.get(getCrudSelector(id)).find('p').contains(name).click();

      cy.location('pathname').should('contain', `/crud-demo-item/${id}`);
      cy.get('h1').should('have.text', name);
    });
  });

  it('should edit CRUD item', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body;

      cy.intercept('PUT', `/api/graphql/${id}/`).as('crudEdited');

      cy.reload();
      editCrudItem(newName, id);

      expectSnackbarToBeDisplayed(CHANGES_SAVED_SNACKBAR_TEXT);
      cy.get('[href$="/crud-demo-item/"]').contains('Go back').click();
      expectCrudToBeDisplayed(newName, id, '@crudEdited');
    });
  });

  it('should delete CRUD item', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body;
      cy.intercept('DELETE', `/api/demo/crud-item/${id}/`).as('crudDeleted');

      cy.reload();
      deleteCrudItem(id);

      expectCrudToBeDeleted(name, id, '@crudDeleted');
    });
  });

  CRUD_DATA.forEach((item) => {
    const { crudName, nameState, errorText } = item;

    it(`should not create CRUD item with ${nameState} name`, () => {
      cy.intercept('POST', '/api/demo/crud-item/').as('crudCreated');

      addCrudItem(crudName);
      expectErrorTextToBeDisplayed(errorText);
      expectRequestNotToHappen('@crudCreated');
    });

    it(`should not edit CRUD item name to be ${nameState}`, () => {
      cy.intercept('PUT', '/api/demo/crud-item/').as('crudEdited');

      createCrudWithApi(name).then((res) => {
        const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;

        cy.reload();
        editCrudItem(crudName, id);
        expectErrorTextToBeDisplayed(errorText);
        expectRequestNotToHappen('@crudEdited');
      });
    });
  });
});
