import { MARK_ALL_NOTIFICATIONS_TEXT } from './assertion';
import { expectHeaderToBeDisplayed, NOTIFICATION_BTN, READ_NOTIFICATION_BTN } from './header';
import { expectSnackbarToBeDisplayed } from './helpers';

const LIGHT_GREY = 'rgb(140, 140, 140)';
const DARK_GREY = 'rgb(38, 38, 38)';

const expectNotificationToBeVisible = (name) => {
  cy.get('[role=link]').should('contain', name);
};

export const openNotificationsList = () => {
  expectHeaderToBeDisplayed();
  cy.get(NOTIFICATION_BTN).click();
};

export const expectCrudToBeDisplayed = (id, name) => {
  cy.get('[role=link]').first().click();
  cy.location('pathname').should('contain', `/crud-demo-item/${id}`);
  cy.get('h1').should('contain', name);
};

const expectNotificationNotToBeVisible = (name) => {
  cy.get('[role=link]').should('not.contain', name);
};

const expectFirstNotificationNotToBeRead = (readAt) => {
  expect(readAt).to.equal(null);

  cy.get('[role=link]').first().shouldHaveColor(DARK_GREY);
};

export const expectNotificationToBeCreated = (id, email, name, alias) => {
  cy.wait(alias).then((res) => {
    const { node } = res.response.body.data.allNotifications.edges[0];
    const { readAt } = res.response.body.data.allNotifications.edges[0].node;

    expect(res.response.body.data.hasUnreadNotifications).to.equal(true);
    expect(node.data.id).to.equal(id);
    expect(node.data.user).to.equal(email);
    expect(node.data.name).to.equal(name);
    openNotificationsList();
    expectNotificationToBeVisible(name);
    expectCrudToBeDisplayed(id, name);
    expectFirstNotificationNotToBeRead(readAt);
  });
};

export const expectNotificationNotToBeCreated = (id, name, alias) => {
  cy.wait(alias).then((res) => {
    const { node } = res.response.body.data.allNotifications.edges[0];

    expect(node.data.id).to.not.equal(id);
    expectHeaderToBeDisplayed();
    expect(node.data.name).to.not.equal(name);
    expectNotificationNotToBeVisible(name);
  });
};

export const expectFirstNotificationToBeRead = (alias) => {
  cy.wait(alias).then((res) => {
    const { readAt } = res.response.body.data.updateNotification.notificationEdge.node;
    expect(readAt).to.not.equal(null);
  });
  cy.get('[role=link]').first().shouldHaveColor(LIGHT_GREY);
};

export const expectNotificationNotToBeRead = (alias) => {
  cy.wait(alias).then((res) => {
    expect(res.response.statusCode).to.eq(200);
    expect(res.response.body.data.hasUnreadNotifications).to.equal(true);
  });
  cy.get('[role=link]').first().shouldHaveColor(DARK_GREY);
};

export const expectAllNotificationsToBeRead = (alias) => {
  cy.wait(alias).then((res) => {
    expect(res.response.statusCode).to.eq(200);
    expect(res.response.body.data.hasUnreadNotifications).to.equal(false);
  });
  cy.get('[role=link]').first().shouldHaveColor(LIGHT_GREY);
};

export const markFirstNotificationAsRead = () => {
  cy.get(READ_NOTIFICATION_BTN).first().click();
};

export const markAllNotificationsAsRead = () => {
  cy.get('button').contains('Mark all as read').click();
  expectSnackbarToBeDisplayed(MARK_ALL_NOTIFICATIONS_TEXT);
};

export const expectNotificationToBeUpdated = (crudId, name, alias) => {
  cy.wait(alias).then((res) => {
    const { node } = res.response.body.data.allNotifications.edges[0];

    expect(res.response.body.data.hasUnreadNotifications).to.equal(true);
    expect(node.type).to.equal('CRUD_ITEM_UPDATED');
    expect(node.data.id).to.equal(crudId);
    expectHeaderToBeDisplayed();
    expectNotificationToBeVisible(name);
  });
};
