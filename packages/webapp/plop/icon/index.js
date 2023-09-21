module.exports = (plop) => {
  const iconsRegisterPath = 'src/images/icons/index.ts';

  plop.setGenerator('icon', {
    description: 'Register icon',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Name:',
      },
    ],
    actions: () => [
      {
        type: 'modify',
        path: iconsRegisterPath,
        pattern: /(\/\/<-- IMPORT ICON FILE -->)/g,
        template: "import { ReactComponent as {{ pascalCase name}}Img } from './{{ camelCase name }}.svg';\n$1",
      },
      {
        type: 'modify',
        path: iconsRegisterPath,
        pattern: /(\/\/<-- EXPORT ICON COMPONENT -->)/g,
        template: 'export const {{ pascalCase name}}Icon = makeIcon({{ pascalCase name }}Img);\n$1',
      },
    ],
  });
};
