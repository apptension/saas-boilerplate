/**
 * Predefined Entity Templates for PLOP generators
 * 
 * These templates provide common entity structures that can be used
 * as starting points for CRUD, Form, and Backend generators.
 */

/**
 * Available entity templates
 */
const ENTITY_TEMPLATES = {
  custom: {
    name: 'Custom (start from scratch)',
    description: 'Build your own entity with custom fields',
    fields: [],
    icon: 'Settings',
  },

  product: {
    name: 'Product',
    description: 'E-commerce product with price, category, and inventory',
    icon: 'Package',
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true,
        label: 'Product Name',
        maxLength: 255,
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        label: 'Description',
      },
      {
        name: 'price',
        type: 'decimal',
        required: true,
        label: 'Price',
        min: 0,
        decimalPlaces: 2,
      },
      {
        name: 'category',
        type: 'string',
        required: false,
        label: 'Category',
        maxLength: 100,
      },
      {
        name: 'imageUrl',
        type: 'url',
        required: false,
        label: 'Image URL',
      },
      {
        name: 'isActive',
        type: 'boolean',
        required: true,
        label: 'Active',
      },
      {
        name: 'stock',
        type: 'number',
        required: false,
        label: 'Stock Quantity',
        min: 0,
      },
    ],
  },

  blogPost: {
    name: 'Blog Post',
    description: 'Blog article with title, content, and publishing info',
    icon: 'FileText',
    fields: [
      {
        name: 'title',
        type: 'string',
        required: true,
        label: 'Title',
        maxLength: 255,
      },
      {
        name: 'slug',
        type: 'string',
        required: true,
        label: 'URL Slug',
        maxLength: 255,
      },
      {
        name: 'excerpt',
        type: 'text',
        required: false,
        label: 'Excerpt',
      },
      {
        name: 'content',
        type: 'text',
        required: true,
        label: 'Content',
      },
      {
        name: 'coverImageUrl',
        type: 'url',
        required: false,
        label: 'Cover Image URL',
      },
      {
        name: 'publishedAt',
        type: 'datetime',
        required: false,
        label: 'Published At',
      },
      {
        name: 'isPublished',
        type: 'boolean',
        required: true,
        label: 'Published',
      },
      {
        name: 'tags',
        type: 'string',
        required: false,
        label: 'Tags (comma-separated)',
        maxLength: 500,
      },
    ],
  },

  userProfile: {
    name: 'User Profile',
    description: 'Extended user profile information',
    icon: 'User',
    fields: [
      {
        name: 'firstName',
        type: 'string',
        required: true,
        label: 'First Name',
        maxLength: 100,
      },
      {
        name: 'lastName',
        type: 'string',
        required: true,
        label: 'Last Name',
        maxLength: 100,
      },
      {
        name: 'bio',
        type: 'text',
        required: false,
        label: 'Bio',
      },
      {
        name: 'avatarUrl',
        type: 'url',
        required: false,
        label: 'Avatar URL',
      },
      {
        name: 'website',
        type: 'url',
        required: false,
        label: 'Website',
      },
      {
        name: 'location',
        type: 'string',
        required: false,
        label: 'Location',
        maxLength: 100,
      },
      {
        name: 'phoneNumber',
        type: 'string',
        required: false,
        label: 'Phone Number',
        maxLength: 20,
      },
    ],
  },

  task: {
    name: 'Task / Todo',
    description: 'Task management with status, priority, and due dates',
    icon: 'CheckSquare',
    fields: [
      {
        name: 'title',
        type: 'string',
        required: true,
        label: 'Title',
        maxLength: 255,
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        label: 'Description',
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        label: 'Status',
        options: ['todo', 'in_progress', 'review', 'done'],
      },
      {
        name: 'priority',
        type: 'select',
        required: true,
        label: 'Priority',
        options: ['low', 'medium', 'high', 'urgent'],
      },
      {
        name: 'dueDate',
        type: 'datetime',
        required: false,
        label: 'Due Date',
      },
      {
        name: 'estimatedHours',
        type: 'decimal',
        required: false,
        label: 'Estimated Hours',
        min: 0,
        decimalPlaces: 1,
      },
      {
        name: 'isCompleted',
        type: 'boolean',
        required: true,
        label: 'Completed',
      },
    ],
  },

  event: {
    name: 'Event',
    description: 'Calendar event with dates, location, and attendees',
    icon: 'Calendar',
    fields: [
      {
        name: 'title',
        type: 'string',
        required: true,
        label: 'Event Title',
        maxLength: 255,
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        label: 'Description',
      },
      {
        name: 'startDate',
        type: 'datetime',
        required: true,
        label: 'Start Date',
      },
      {
        name: 'endDate',
        type: 'datetime',
        required: true,
        label: 'End Date',
      },
      {
        name: 'location',
        type: 'string',
        required: false,
        label: 'Location',
        maxLength: 255,
      },
      {
        name: 'isOnline',
        type: 'boolean',
        required: true,
        label: 'Online Event',
      },
      {
        name: 'meetingUrl',
        type: 'url',
        required: false,
        label: 'Meeting URL',
      },
      {
        name: 'maxAttendees',
        type: 'number',
        required: false,
        label: 'Max Attendees',
        min: 1,
      },
      {
        name: 'isPublic',
        type: 'boolean',
        required: true,
        label: 'Public Event',
      },
    ],
  },

  project: {
    name: 'Project',
    description: 'Project with team, budget, and timeline',
    icon: 'Folder',
    fields: [
      {
        name: 'name',
        type: 'string',
        required: true,
        label: 'Project Name',
        maxLength: 255,
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        label: 'Description',
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        label: 'Status',
        options: ['planning', 'active', 'on_hold', 'completed', 'cancelled'],
      },
      {
        name: 'startDate',
        type: 'date',
        required: false,
        label: 'Start Date',
      },
      {
        name: 'endDate',
        type: 'date',
        required: false,
        label: 'End Date',
      },
      {
        name: 'budget',
        type: 'decimal',
        required: false,
        label: 'Budget',
        min: 0,
        decimalPlaces: 2,
      },
      {
        name: 'isArchived',
        type: 'boolean',
        required: true,
        label: 'Archived',
      },
    ],
  },

  contact: {
    name: 'Contact',
    description: 'Contact or lead with communication info',
    icon: 'Users',
    fields: [
      {
        name: 'firstName',
        type: 'string',
        required: true,
        label: 'First Name',
        maxLength: 100,
      },
      {
        name: 'lastName',
        type: 'string',
        required: true,
        label: 'Last Name',
        maxLength: 100,
      },
      {
        name: 'email',
        type: 'email',
        required: true,
        label: 'Email',
      },
      {
        name: 'phone',
        type: 'string',
        required: false,
        label: 'Phone',
        maxLength: 20,
      },
      {
        name: 'company',
        type: 'string',
        required: false,
        label: 'Company',
        maxLength: 100,
      },
      {
        name: 'jobTitle',
        type: 'string',
        required: false,
        label: 'Job Title',
        maxLength: 100,
      },
      {
        name: 'notes',
        type: 'text',
        required: false,
        label: 'Notes',
      },
      {
        name: 'source',
        type: 'select',
        required: false,
        label: 'Source',
        options: ['website', 'referral', 'social', 'advertising', 'other'],
      },
    ],
  },

  document: {
    name: 'Document',
    description: 'Document or file with metadata',
    icon: 'File',
    fields: [
      {
        name: 'title',
        type: 'string',
        required: true,
        label: 'Title',
        maxLength: 255,
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        label: 'Description',
      },
      {
        name: 'fileUrl',
        type: 'url',
        required: true,
        label: 'File URL',
      },
      {
        name: 'fileType',
        type: 'select',
        required: true,
        label: 'File Type',
        options: ['pdf', 'doc', 'spreadsheet', 'image', 'video', 'other'],
      },
      {
        name: 'fileSize',
        type: 'number',
        required: false,
        label: 'File Size (bytes)',
        min: 0,
      },
      {
        name: 'isPublic',
        type: 'boolean',
        required: true,
        label: 'Public',
      },
    ],
  },
};

/**
 * Get list of template choices for Inquirer prompts
 * @returns {Array} Array of choices
 */
function getTemplateChoices() {
  return Object.entries(ENTITY_TEMPLATES).map(([key, template]) => ({
    name: `${template.name} - ${template.description}`,
    value: key,
    short: template.name,
  }));
}

/**
 * Get a template by key
 * @param {string} key - Template key
 * @returns {Object} Template object
 */
function getTemplate(key) {
  return ENTITY_TEMPLATES[key] || ENTITY_TEMPLATES.custom;
}

/**
 * Get template fields with optional customization
 * @param {string} key - Template key
 * @returns {Array} Array of field configurations
 */
function getTemplateFields(key) {
  const template = getTemplate(key);
  // Return a deep copy to prevent mutations
  return JSON.parse(JSON.stringify(template.fields));
}

/**
 * Add a field to a template's fields
 * @param {Array} fields - Existing fields array
 * @param {Object} newField - New field to add
 * @returns {Array} Updated fields array
 */
function addField(fields, newField) {
  return [...fields, newField];
}

/**
 * Remove a field from a template's fields
 * @param {Array} fields - Existing fields array
 * @param {string} fieldName - Name of field to remove
 * @returns {Array} Updated fields array
 */
function removeField(fields, fieldName) {
  return fields.filter((f) => f.name !== fieldName);
}

/**
 * Update a field in a template's fields
 * @param {Array} fields - Existing fields array
 * @param {string} fieldName - Name of field to update
 * @param {Object} updates - Updates to apply
 * @returns {Array} Updated fields array
 */
function updateField(fields, fieldName, updates) {
  return fields.map((f) => (f.name === fieldName ? { ...f, ...updates } : f));
}

/**
 * Validate fields array
 * @param {Array} fields - Fields to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateFields(fields) {
  const errors = [];
  const names = new Set();

  fields.forEach((field, index) => {
    if (!field.name) {
      errors.push(`Field ${index + 1}: Name is required`);
    } else if (names.has(field.name)) {
      errors.push(`Field ${index + 1}: Duplicate field name "${field.name}"`);
    } else {
      names.add(field.name);
    }

    if (!field.type) {
      errors.push(`Field ${index + 1}: Type is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create prompts for template selection and customization
 * @returns {Array} Array of Inquirer prompts
 */
function createTemplatePrompts() {
  return [
    {
      type: 'list',
      name: 'template',
      message: 'Select an entity template:',
      choices: getTemplateChoices(),
      default: 'custom',
    },
    {
      type: 'confirm',
      name: 'customizeTemplate',
      message: 'Would you like to customize the fields?',
      default: false,
      when: (answers) => answers.template !== 'custom',
    },
  ];
}

/**
 * Get fields summary for display
 * @param {Array} fields - Fields array
 * @returns {string} Formatted summary string
 */
function getFieldsSummary(fields) {
  if (fields.length === 0) {
    return 'No fields defined';
  }

  return fields
    .map((f) => `  - ${f.name} (${f.type}${f.required ? ', required' : ''})`)
    .join('\n');
}

module.exports = {
  ENTITY_TEMPLATES,
  getTemplateChoices,
  getTemplate,
  getTemplateFields,
  addField,
  removeField,
  updateField,
  validateFields,
  createTemplatePrompts,
  getFieldsSummary,
};
