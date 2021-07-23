import BASIC_AUTH from '../fixtures/basicAuth';
import { logOut } from '../support/authentication';
import { createCrudWithApi, deleteTestCrudItems, editCrudWithApi } from '../support/crud';
import { generateEmail } from '../support/helpers';
import {
  clickFirstNotification,
  expectFirstNotificationToBeRead,
  expectNotificationToBeCreated,
  expectToHaveUnreadNotification,
  expectToHaveAllReadNotification,
  markAllNotificationsAsRead,
  expectNotificationToBeUpdated,
  expectNotificationNotToBeCreated,
} from '../support/notifications';

const userEmail = Cypress.env('EMAIL');
const password = Cypress.env('PASSWORD');
const name = 'E2E CRUD item - created';
const newName = 'E2E CRUD item - edited';
const adminEmail = generateEmail(Cypress.env('EMAIL'), 'admin');

describe('User Notifications', () => {
  before(() => {
    cy.getJWTtoken(userEmail, password);
    deleteTestCrudItems([name, newName]);
  });

  beforeEach(() => {
    cy.getJWTtoken(userEmail, password);
    cy.visit('/en/crud-demo-item/', BASIC_AUTH);
    cy.interceptGraphQl('addCrudDemoItem');
    cy.interceptGraphQl('updateCrudDemoItem');
    cy.interceptGraphQl('crudDemoItemListItemDelete');
    cy.interceptGraphQl('notificationMutation');
  });

  it('should not create a notification when creating an item for user', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;
      cy.interceptGraphQl('notificationsList');
      cy.reload();
      expectNotificationNotToBeCreated(id, '@notificationsList');
    });
  });

  it('should create notification about updated CRUD by Admin', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;

      logOut();

      cy.getJWTtoken(adminEmail, password);
      cy.visit('/en/crud-demo-item/', BASIC_AUTH);
      editCrudWithApi(id, newName);

      logOut();

      cy.interceptGraphQl('notificationsList');
      cy.getJWTtoken(userEmail, password);
      cy.visit('/en/crud-demo-item/', BASIC_AUTH);

      expectNotificationToBeUpdated(id, '@notificationsList');
    });
  });
});

// TODO change role of user+admin@gmail.com to 'admin' once SB-521 is done
describe('Admin Notifications', () => {
  before(() => {
    cy.getJWTtoken(adminEmail, password);
    deleteTestCrudItems([name, newName]);
  });

  beforeEach(() => {
    cy.getJWTtoken(adminEmail, password);
    cy.visit('/en/crud-demo-item/', BASIC_AUTH);
    cy.interceptGraphQl('addCrudDemoItem');
    cy.interceptGraphQl('updateCrudDemoItem');
    cy.interceptGraphQl('crudDemoItemListItemDelete');
    cy.interceptGraphQl('notificationMutation');
  });

  it('should create a notification when creating an item for admin', () => {
    createCrudWithApi(name).then((res) => {
      const { id } = res.body.data.createCrudDemoItem.crudDemoItemEdge.node;
      cy.interceptGraphQl('notificationsList');
      cy.reload();
      expectNotificationToBeCreated(id, '@notificationsList');
    });
  });

  it('should mark the first notification as read', () => {
    cy.interceptGraphQl('notificationsList');
    cy.wait('@notificationsList').its('response.statusCode').should('eq', 200);
    clickFirstNotification();
    expectFirstNotificationToBeRead('@notificationMutation');
  });

  it('should mark all notifications as read', () => {
    createCrudWithApi(name).then(() => {});
    cy.interceptGraphQl('notificationsList');
    cy.reload();

    expectToHaveUnreadNotification('@notificationsList');
    markAllNotificationsAsRead();

    cy.interceptGraphQl('notificationsList');
    cy.reload();
    cy.wait('@notificationsList').its('response.statusCode').should('eq', 200);

    expectToHaveAllReadNotification('@notificationsList');
  });
});
