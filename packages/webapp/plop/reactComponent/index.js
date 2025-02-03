const path = require('path');
const { Str } = require('@supercharge/strings');
const { complement, isEmpty } = require('ramda');

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
      {
        type: 'confirm',
        name: 'hasProps',
        message: 'Do you want to include props?',
        default: true,
      },
    ],
    actions: (data) => [
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
        path: `${componentDirectory}/{{ camelCase name }}.stories.tsx`,
        templateFile: path.join(templatesPath, 'stories.hbs'),
        data: {
          storyTitleNamespace: (() => {
            const rules = [
              { path: 'shared/components', base: 'Shared' },
              { path: 'routes', base: 'Routes' },
            ];

            for (const { path, base } of rules) {
              if (data.directory.startsWith(path)) {
                const nestedComponentsPaths = data.directory
                  .slice(path.length + 1)
                  .split('/')
                  .filter(complement(isEmpty))
                  .map((name) => Str(name).pascal().get());

                return [base, ...nestedComponentsPaths, ''].join('/');
              }
            }

            return '';
          })(),
        },
      },
      {
        type: 'add',
        path: `${componentDirectory}/__tests__/{{ camelCase name }}.component.spec.tsx`,
        templateFile: path.join(templatesPath, '__tests__/component.spec.hbs'),
        data: {
          testUtilsPath: path.relative(
            path.join(componentDirectoryAbsolute, '__tests__/{{ camelCase name }}.component.spec.tsx'),
            path.join(projectPathAbsolute, 'src/tests/utils/rendering')
          ),
        },
      },
    ],
  });
};
