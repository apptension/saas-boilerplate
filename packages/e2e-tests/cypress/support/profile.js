export const FIRST_NAME_INPUT = '[name="firstName"]';
export const LAST_NAME_INPUT = '[name="lastName"]';
export const OLD_PASSWORD_INPUT = '[name="oldPassword"]';
export const NEW_PASSWORD_INPUT = '[name="newPassword"]';
export const CONFIRM_NEW_PASSWORD_INPUT = '[name="confirmNewPassword"]';

const setFirstName = (firstName) => cy.get(FIRST_NAME_INPUT).type(firstName);

const setLastName = (lastName) => cy.get(LAST_NAME_INPUT).type(lastName);

export const updateUserProfile = ({ firstName, lastName }) => {
  setFirstName(firstName);
  setLastName(lastName);
  cy.get('button').contains('Update personal data').click();
};

export const UserProfileResponseFactory = (responseObj, { firstName, lastName }) => {
  const updatedResponse = responseObj;
  updatedResponse.first_name = firstName;
  updatedResponse.last_name = lastName;
  return responseObj;
};

const setOldPassword = (oldPassword) =>
  cy.get(OLD_PASSWORD_INPUT).type(oldPassword, { sensitive: true });

const setNewPassword = (newPassword) =>
  cy.get(NEW_PASSWORD_INPUT).type(newPassword, { sensitive: true });

const setConfirmNewPassword = (confirmNewPassword) =>
  cy.get(CONFIRM_NEW_PASSWORD_INPUT).type(confirmNewPassword, { sensitive: true });

export const updatePassword = ({ oldPassword, newPassword, confirmPassword }) => {
  setOldPassword(oldPassword);
  setNewPassword(newPassword);
  setConfirmNewPassword(confirmPassword);
  cy.get('button').contains('Change password').click();
};

export const updatePasswordWithApi = ({ oldPassword, newPassword, token }) =>
  cy.request({
    method: 'POST',
    url: '/api/auth/change-password/',
    body: {
      old_password: oldPassword,
      new_password: newPassword,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
