import { MARK_ALL_NOTIFICATIONS_TEXT } from './assertion';
import {
  ALL_READ_BTN,
  expectHeaderToBeDisplayed,
  NOTIFICATION_BTN,
  READ_NOTIFICATION_BTN,
} from './header';
import { expectSnackbarToBeDisplayed } from './helpers';

export const expectNotificationToBeCreated = (id, alias) => {
  cy.wait(alias).then((res) => {
    const { node } = res.response.body.data.allNotifications.edges[0];

    expect(res.response.body.data.hasUnreadNotifications).to.equal(true);
    expect(node.data.id).to.equal(id);
    expect(node.type).to.equal('CRUD_ITEM_CREATED');
    expect(node.readAt).to.equal(null);
  });
};

export const expectNotificationNotToBeCreated = (id, alias) => {
  cy.wait(alias).then((res) => {
    const { node } = res.response.body.data.allNotifications.edges[0];

    expect(node.data.id).to.not.equal(id);
  });
};

export const clickFirstNotification = () => {
  expectHeaderToBeDisplayed();
  cy.get(NOTIFICATION_BTN).click();
  cy.get(READ_NOTIFICATION_BTN).first().click();
};

export const expectFirstNotificationToBeRead = (alias) => {
  cy.wait(alias).then((res) => {
    const { readAt } = res.response.body.data.updateNotification.notificationEdge.node;
    expect(readAt).to.not.equal(null);
  });
};

export const expectToHaveUnreadNotification = (alias) => {
  cy.wait(alias).then((res) => {
    expect(res.response.statusCode).to.eq(200);
    expect(res.response.body.data.hasUnreadNotifications).to.equal(true);
  });
};

export const expectToHaveAllReadNotification = (alias) => {
  cy.wait(alias).then((res) => {
    expect(res.response.statusCode).to.eq(200);
    expect(res.response.body.data.hasUnreadNotifications).to.equal(false);
  });
};

export const markAllNotificationsAsRead = () => {
  expectHeaderToBeDisplayed();
  cy.get(NOTIFICATION_BTN).click();
  cy.get(ALL_READ_BTN).contains('Mark all as read').click();
  expectSnackbarToBeDisplayed(MARK_ALL_NOTIFICATIONS_TEXT);
};

export const expectNotificationToBeUpdated = (crudId, alias) => {
  cy.wait(alias).then((res) => {
    const { node } = res.response.body.data.allNotifications.edges[0];

    expect(res.response.body.data.hasUnreadNotifications).to.equal(true);
    expect(node.type).to.equal('CRUD_ITEM_UPDATED');
    expect(node.data.id).to.equal(crudId);
  });
};
