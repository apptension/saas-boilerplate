export const MENU_BTN = '[aria-label="Open profile menu"]';
export const HOME_BTN = '[aria-label="Go back home"]';
export const NOTIFICATION_BTN = '[aria-label="Open notifications"]';
export const READ_NOTIFICATION_BTN = "[role='link'] button";

export const expectHeaderToBeDisplayed = () => {
  cy.get(HOME_BTN).should('be.visible');
  cy.get(MENU_BTN).should('be.visible');
  cy.get(NOTIFICATION_BTN).should('be.visible');
};

export const openMenu = () => cy.get(MENU_BTN).click();
