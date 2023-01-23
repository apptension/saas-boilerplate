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
  expectEditedCrudToBeDisplayed,
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
    cy.interceptGraphQl('addCrudDemoItem');
    cy.interceptGraphQl('updateCrudDemoItem');
    cy.interceptGraphQl('crudDemoItemListItemDelete');
    cy.visit('/en/crud-demo-item/', BASIC_AUTH);
  });

  it('should create CRUD item', () => {
    addCrudItem(name);
    cy.interceptGraphQl('crudDemoItemList');
    expectCrudToBeCreated(name, '@addCrudDemoItem', '@crudDemoItemList');
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
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;

      editCrudItem(newName, id);
      expectSnackbarToBeDisplayed(CHANGES_SAVED_SNACKBAR_TEXT);
      cy.get('[href$="/crud-demo-item/"]').contains('Go back').click();

      expectEditedCrudToBeDisplayed(newName, id, '@updateCrudDemoItem');
    });
  });

  it('should delete CRUD item', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;

      cy.reload();
      deleteCrudItem(id);

      expectCrudToBeDeleted(name, id, '@crudDemoItemListItemDelete');
    });
  });

  CRUD_DATA.forEach((item) => {
    const { crudName, nameState, errorText } = item;

    it(`should not create CRUD item with ${nameState} name`, () => {
      addCrudItem(crudName);
      expectErrorTextToBeDisplayed(errorText);
      expectRequestNotToHappen('@addCrudDemoItem');
    });

    it(`should not edit CRUD item name to be ${nameState}`, () => {
      createCrudWithApi(name).then((res) => {
        const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;

        cy.reload();
        editCrudItem(crudName, id);
        expectErrorTextToBeDisplayed(errorText);
        expectRequestNotToHappen('@updateCrudDemoItem');
      });
    });
  });
});
