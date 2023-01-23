import BASIC_AUTH from '../fixtures/basicAuth';
import { logOut } from '../support/authentication';
import { createCrudWithApi, deleteTestCrudItems, editCrudWithApi } from '../support/crud';
import { generateEmail } from '../support/helpers';
import {
  markFirstNotificationAsRead,
  expectFirstNotificationToBeRead,
  expectNotificationToBeCreated,
  expectNotificationNotToBeRead,
  expectAllNotificationsToBeRead,
  markAllNotificationsAsRead,
  expectNotificationToBeUpdated,
  expectNotificationNotToBeCreated,
  expectCrudToBeDisplayed,
  openNotificationsList,
} from '../support/notifications';

const userEmail = Cypress.env('EMAIL');
const password = Cypress.env('PASSWORD');
const name = 'E2E CRUD item - created';
const notificationNotVisibleName = 'E2E Crud item - notification not visible for user';
const notificationVisibleName = 'E2E Crud item - notification visible for admin';
const notificationMarkedName = 'E2E Crud item - notification marked as read';
const notificationUpdatedByAdminName = 'E2E Crud item - notification about updated item by admin';
const notificationCreatedName = 'E2E Crud item - notification created';
const notificationNotCreatedName = 'E2E Crud item - notification not created';
const adminEmail = generateEmail(Cypress.env('EMAIL'), 'admin');

describe('User Notifications', () => {
  before(() => {
    cy.getJWTtoken(userEmail, password);
    deleteTestCrudItems([
      name,
      notificationNotVisibleName,
      notificationUpdatedByAdminName,
      notificationVisibleName,
      notificationMarkedName,
      notificationUpdatedByAdminName,
      notificationCreatedName,
      notificationNotCreatedName,
    ]);
  });

  beforeEach(() => {
    cy.getJWTtoken(userEmail, password);
    cy.interceptGraphQl('addCrudDemoItem');
    cy.interceptGraphQl('updateCrudDemoItem');
    cy.interceptGraphQl('crudDemoItemListItemDelete');
    cy.interceptGraphQl('notificationMutation');
    cy.visit('/en/crud-demo-item/', BASIC_AUTH);
  });

  it('should not create a notification when creating an item for user', () => {
    createCrudWithApi(notificationNotVisibleName).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;
      cy.interceptGraphQl('notificationsList');
      cy.reload();
      expectNotificationNotToBeCreated(id, notificationNotVisibleName, '@notificationsList');
    });
  });

  it('should create notification about CRUD updated by Admin', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;

      logOut();

      cy.getJWTtoken(adminEmail, password);
      cy.visit('/en/crud-demo-item/', BASIC_AUTH);
      editCrudWithApi(id, notificationUpdatedByAdminName);

      logOut();

      cy.interceptGraphQl('notificationsList');
      cy.getJWTtoken(userEmail, password);
      cy.visit('/en/crud-demo-item/', BASIC_AUTH);

      expectNotificationToBeUpdated(id, notificationUpdatedByAdminName, '@notificationsList');
    });
  });
});

describe('Admin Notifications', () => {
  before(() => {
    cy.getJWTtoken(adminEmail, password);
    deleteTestCrudItems([name, notificationVisibleName, notificationMarkedName]);
  });

  beforeEach(() => {
    cy.getJWTtoken(adminEmail, password);
    cy.interceptGraphQl('addCrudDemoItem');
    cy.interceptGraphQl('updateCrudDemoItem');
    cy.interceptGraphQl('crudDemoItemListItemDelete');
    cy.interceptGraphQl('notificationMutation');
    cy.interceptGraphQl('notificationsList');
    cy.visit('/en/crud-demo-item/', BASIC_AUTH);
  });

  it('should create a notification when creating an item as admin', () => {
    createCrudWithApi(notificationVisibleName).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;
      expectNotificationToBeCreated(id, adminEmail, notificationVisibleName, '@notificationsList');
    });
  });

  it('should open created notification', () => {
    createCrudWithApi(notificationCreatedName).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;
      cy.interceptGraphQl('notificationsList');
      cy.reload();
      cy.wait('@notificationsList').its('response.statusCode').should('eq', 200);
      openNotificationsList();
      expectCrudToBeDisplayed(id, notificationCreatedName);
    });
  });

  it('should mark first notification as read', () => {
    createCrudWithApi(notificationMarkedName).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;
      expectNotificationToBeCreated(id, adminEmail, notificationMarkedName, '@notificationsList');
    });
    openNotificationsList();
    markFirstNotificationAsRead();
    expectFirstNotificationToBeRead('@notificationMutation');
  });

  it('should mark all notifications as read', () => {
    createCrudWithApi(name);

    expectNotificationNotToBeRead('@notificationsList');
    openNotificationsList();
    markAllNotificationsAsRead();

    cy.interceptGraphQl('notificationsList');
    cy.reload();
    cy.wait('@notificationsList').its('response.statusCode').should('eq', 200);

    expectAllNotificationsToBeRead('@notificationsList');
  });
});
