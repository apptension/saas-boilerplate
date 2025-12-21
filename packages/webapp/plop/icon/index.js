module.exports = (plop) => {
  const iconsRegisterPath = 'src/images/icons/index.ts';

  plop.setGenerator('icon', {
    description: 'Register a new icon from an SVG file',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Icon name (e.g., "CustomLogo", "BrandMark"):',
        validate: plop.validators.required,
      },
      {
        type: 'confirm',
        name: 'hasSvgFile',
        message: 'Do you already have the SVG file in src/images/icons/?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [
        {
          type: 'modify',
          path: iconsRegisterPath,
          pattern: /(\/\/<-- IMPORT ICON FILE -->)/g,
          template: "import { ReactComponent as {{ pascalCase name }}Img } from './{{ camelCase name }}.svg';\n$1",
        },
        {
          type: 'modify',
          path: iconsRegisterPath,
          pattern: /(\/\/<-- EXPORT ICON COMPONENT -->)/g,
          template: 'export const {{ pascalCase name }}Icon = makeIcon({{ pascalCase name }}Img);\n$1',
        },
      ];

      const svgNote = data.hasSvgFile
        ? '   ✓ SVG file expected at: src/images/icons/{{ camelCase name }}.svg'
        : '   ⚠ Remember to add your SVG file: src/images/icons/{{ camelCase name }}.svg';

      actions.push({
        type: 'logSuccess',
        message: `
✅ Icon "{{ pascalCase name }}Icon" registered successfully!

${svgNote}

📝 Usage:
   import { {{ pascalCase name }}Icon } from '@/images/icons';

   <{{ pascalCase name }}Icon className="h-6 w-6" />

💡 Tips:
   - For most cases, prefer using Lucide icons directly: import { IconName } from 'lucide-react'
   - Custom icons are best for brand assets and unique graphics
   - Optimize your SVG using SVGO before adding
`,
      });

      return actions;
    },
  });
};
