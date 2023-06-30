const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const notificationsLibNamespace = '../webapp-libs/webapp-notifications/src';
  const notificationsNamespace = 'src/shared/components/notifications';
  const notificationDirectory = path.join(notificationsNamespace, '{{ camelCase name }}');

  plop.setGenerator('notification', {
    description: 'Generate a notification',
    prompts: [
      {
        type: 'name',
        name: 'name',
        message: 'Name:',
      },
    ],
    actions: [
      {
        type: 'add',
        path: `${notificationDirectory}/index.ts`,
        templateFile: path.join(templatesPath, 'index.hbs'),
      },
      {
        type: 'add',
        path: `${notificationDirectory}/{{ camelCase name }}.component.tsx`,
        templateFile: path.join(templatesPath, 'component.hbs'),
      },
      {
        type: 'add',
        path: `${notificationDirectory}/{{ camelCase name }}.stories.tsx`,
        templateFile: path.join(templatesPath, 'stories.hbs'),
      },
      {
        type: 'modify',
        path: `${notificationsNamespace}/index.ts`,
        pattern: /(\/\/<-- INJECT NOTIFICATION EXPORT -->)/g,
        template: "export { {{ pascalCase name }} } from './{{ camelCase name }}';\n$1",
      },
      {
        type: 'modify',
        path: `${notificationsLibNamespace}/notifications.types.ts`,
        pattern: /(\/\/<-- INJECT NOTIFICATION TYPE -->)/g,
        template: "{{ constantCase name }} = '{{ constantCase name }}',\n  $1",
      },
    ],
  });
};
