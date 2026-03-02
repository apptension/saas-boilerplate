const path = require('path');

const templatesPath = path.join(__dirname, 'templates');

module.exports = (plop) => {
  const modalDirectory = 'src/{{ directory }}/{{ camelCase name }}Modal';

  plop.setGenerator('modal', {
    description: 'Generate a Modal/Dialog component',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Modal name (e.g., "DeleteConfirm", "EditProfile", "Welcome"):',
        validate: plop.validators.required,
      },
      {
        type: 'directory',
        name: 'directory',
        basePath: 'src',
        message: "Modal's directory:",
      },
      {
        type: 'list',
        name: 'variant',
        message: 'Modal variant:',
        choices: [
          { name: 'Confirm - Yes/No confirmation dialog', value: 'confirm' },
          { name: 'Form - Modal with embedded form', value: 'form' },
          { name: 'Info - Display information/content', value: 'info' },
          { name: 'Custom - Empty modal template', value: 'custom' },
        ],
        default: 'confirm',
      },
      {
        type: 'confirm',
        name: 'isDestructive',
        message: 'Is this a destructive action (red styling)?',
        default: false,
        when: (answers) => answers.variant === 'confirm',
      },
      {
        type: 'input',
        name: 'modalTitle',
        message: 'Modal title:',
        default: (answers) => {
          const name = answers.name.replace(/([A-Z])/g, ' $1').trim();
          return name;
        },
      },
      {
        type: 'input',
        name: 'modalDescription',
        message: 'Modal description/content:',
        default: 'Are you sure you want to continue?',
        when: (answers) => answers.variant === 'confirm',
      },
      {
        type: 'confirm',
        name: 'withHook',
        message: 'Generate a custom hook for modal state?',
        default: true,
      },
    ],
    actions: (data) => {
      const actions = [
        // Index file
        {
          type: 'add',
          path: `${modalDirectory}/index.ts`,
          templateFile: path.join(templatesPath, 'index.hbs'),
        },
        // Modal component based on variant
        {
          type: 'add',
          path: `${modalDirectory}/{{ camelCase name }}Modal.component.tsx`,
          templateFile: path.join(templatesPath, `modal.${data.variant}.hbs`),
        },
        // Stories
        {
          type: 'add',
          path: `${modalDirectory}/{{ camelCase name }}Modal.stories.tsx`,
          templateFile: path.join(templatesPath, 'modal.stories.hbs'),
        },
        // Test
        {
          type: 'add',
          path: `${modalDirectory}/__tests__/{{ camelCase name }}Modal.component.spec.tsx`,
          templateFile: path.join(templatesPath, '__tests__/modal.spec.hbs'),
        },
      ];

      // Optional hook
      if (data.withHook) {
        actions.push({
          type: 'add',
          path: `${modalDirectory}/use{{ pascalCase name }}Modal.hook.ts`,
          templateFile: path.join(templatesPath, 'modal.hook.hbs'),
        });
      }

      // Success message
      actions.push({
        type: 'logSuccess',
        message: `
✅ Modal "{{ pascalCase name }}Modal" created successfully!

📁 Created files:
   - ${modalDirectory}/index.ts
   - ${modalDirectory}/{{ camelCase name }}Modal.component.tsx
   - ${modalDirectory}/{{ camelCase name }}Modal.stories.tsx
   - ${modalDirectory}/__tests__/{{ camelCase name }}Modal.component.spec.tsx${data.withHook ? `\n   - ${modalDirectory}/use{{ pascalCase name }}Modal.hook.ts` : ''}

📝 Usage:
${data.withHook ? `
   // With hook:
   import { use{{ pascalCase name }}Modal } from './${data.directory}/{{ camelCase name }}Modal';

   const { isOpen, open, close, Modal } = use{{ pascalCase name }}Modal();

   <button onClick={open}>Open Modal</button>
   <Modal onConfirm={handleConfirm} />
` : `
   // Direct usage:
   import { {{ pascalCase name }}Modal } from './${data.directory}/{{ camelCase name }}Modal';

   const [isOpen, setIsOpen] = useState(false);

   <{{ pascalCase name }}Modal
     isOpen={isOpen}
     onClose={() => setIsOpen(false)}
     onConfirm={handleConfirm}
   />
`}`,
      });

      return actions;
    },
  });
};
