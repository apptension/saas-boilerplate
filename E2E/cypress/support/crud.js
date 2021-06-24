import { CHANGES_SAVED_SNACKBAR_TEXT } from './assertion';
import { getToken, SUBMIT_BTN } from './authentication';
import { expectSnackbarToBeDisplayed } from './helpers';

const ADD_CRUD_ITEM_BTN = '[href$="/crud-demo-item/add"]';
const CRUD_NAME_INPUT = 'input[name="name"]';

export const getCrudSelector = (id) => `[href$="/crud-demo-item/${id}"]`;
export const editCrudSelector = (id) => `[href$="/crud-demo-item/${id}/edit"]`;
export const deleteCrudItem = (id) =>
  cy.get(getCrudSelector(id)).parent().contains('Delete').click();

const setCrudName = (name) => {
  cy.get(CRUD_NAME_INPUT).type(name);
};

export const addCrudItem = (name) => {
  cy.get(ADD_CRUD_ITEM_BTN).click();
  setCrudName(name);
  cy.get(SUBMIT_BTN).click();
};

export const editCrudItem = (name, id) => {
  cy.get(editCrudSelector(id)).contains('Edit').click();

  cy.location('pathname').should('contain', `/crud-demo-item/${id}/edit`);

  setCrudName(name);
  cy.get(SUBMIT_BTN).click();
};

export const expectCrudToBeDisplayed = (name, id, alias) => {
  cy.wait(alias).then((res) => {
    expect(res.response.body).to.deep.include({ name, id });
  });
  cy.get(getCrudSelector(id)).find('p').contains(name);
};

export const expectCrudToBeCreated = (name, postAlias, getAlias) => {
  cy.wait(postAlias).then((res) => {
    const { id } = res.response.body;
    expect(res.response.statusCode).to.equal(201);
    expect(res.response.body).to.eql({ name, id });
    expectSnackbarToBeDisplayed(CHANGES_SAVED_SNACKBAR_TEXT);

    expectCrudToBeDisplayed(name, id, getAlias);
  });
};

const getCrudItems = () =>
  cy.request({
    url: '/api/demo/crud-item/',
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

export const expectCrudToBeDeleted = (name, id, alias) => {
  cy.wait(alias).then((deleteRes) => {
    expect(deleteRes.response.statusCode).to.equal(204);
    cy.get('li').find('p').should('not.have.text', name);
    cy.get('li').find('a').should('not.contain', `/crud-demo-item/${id}`);
    getCrudItems().then((res) => expect(res.body).not.to.deep.include({ name, id }));
  });
};

export const createCrudWithApi = (name) => {
  return cy.request({
    method: 'POST',
    url: '/api/graphql/',
    body: {
      query:
        'mutation addCrudDemoItemMutation(\n  $input: CreateCrudDemoItemMutationInput!\n) {\n  createCrudDemoItem(input: $input) {\n    crudDemoItemEdge {\n      node {\n        id\n        name\n      }\n    }\n  }\n}\n',
      variables: {
        input: {
          name,
        },
        connections: ['client:root:__crudDemoItemList_allCrudDemoItems_connection'],
      },
    },
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const getCrudIdByName = (name) => {
  return getCrudItems().then((res) =>
    res.body.filter((obj) => obj.name.includes(name)).map((items) => items.id)
  );
};

export const deleteCrudWithApi = (id) => {
  if (typeof id !== 'undefined') {
    return cy.request({
      method: 'DELETE',
      url: `/api/demo/crud-item/${id}/`,
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
  }
  return cy.log('No CRUD items to delete');
};

export const deleteTestCrudItems = (names) =>
  names.forEach((name) =>
    getCrudIdByName(name).then((ids) => ids.forEach((id) => deleteCrudWithApi(id)))
  );
