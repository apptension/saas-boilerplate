const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const componentDirectory = 'src/{{ directory }}/{{ camelCase name }}';

  const projectPathAbsolute = plop.getDestBasePath();
  const componentDirectoryAbsolute = path.join(projectPathAbsolute, componentDirectory);

  plop.setGenerator('component', {
    description: 'Generate a React component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Component's directory:",
      },
    ],
    actions: [
      {
        type: 'add',
        path: `${componentDirectory}/index.ts`,
        templateFile: path.join(templatesPath, 'index.hbs'),
      },
      {
        type: 'add',
        path: `${componentDirectory}/{{ camelCase name }}.component.tsx`,
        templateFile: path.join(templatesPath, 'component.hbs'),
      },
      {
        type: 'add',
        path: `${componentDirectory}/{{ camelCase name }}.styles.ts`,
        templateFile: path.join(templatesPath, 'styles.hbs'),
      },
      {
        type: 'add',
        path: `${componentDirectory}/{{ camelCase name }}.stories.tsx`,
        templateFile: path.join(templatesPath, 'stories.hbs'),
      },
      {
        type: 'add',
        path: `${componentDirectory}/__tests__/{{ camelCase name }}.component.spec.tsx`,
        templateFile: path.join(templatesPath, '__tests__/component.spec.hbs'),
        data: {
          testUtilsPath: path.relative(
            path.join(componentDirectoryAbsolute, '__tests__/{{ camelCase name }}.component.spec.tsx'),
            path.join(projectPathAbsolute, 'src/shared/utils/testUtils')
          ),
        },
      },
    ],
  });
};
