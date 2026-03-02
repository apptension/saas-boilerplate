/**
 * Interactive Field Builder for PLOP generators
 * 
 * Provides prompts for building multi-field forms and models
 * with support for various field types and validation options.
 */

const config = require('../config');

/**
 * Available field types with their configurations
 */
const FIELD_TYPES = {
  string: {
    label: 'Text (single line)',
    defaultMaxLength: 255,
    hasMaxLength: true,
  },
  text: {
    label: 'Text (multi-line)',
    hasMaxLength: false,
  },
  number: {
    label: 'Number (integer)',
    hasMinMax: true,
  },
  decimal: {
    label: 'Number (decimal)',
    hasMinMax: true,
    hasDecimalPlaces: true,
  },
  boolean: {
    label: 'Boolean (yes/no)',
    defaultValue: false,
  },
  date: {
    label: 'Date',
  },
  datetime: {
    label: 'Date and Time',
  },
  email: {
    label: 'Email',
    hasMaxLength: true,
    defaultMaxLength: 254,
  },
  url: {
    label: 'URL',
    hasMaxLength: true,
    defaultMaxLength: 2000,
  },
  select: {
    label: 'Single Select (dropdown)',
    hasOptions: true,
  },
  multiselect: {
    label: 'Multiple Select',
    hasOptions: true,
  },
  file: {
    label: 'File Upload',
  },
  image: {
    label: 'Image Upload',
  },
  relation: {
    label: 'Relation (foreign key)',
    hasRelation: true,
  },
};

/**
 * Get the list of field type choices for prompts
 * @returns {Array} Array of choices for Inquirer
 */
function getFieldTypeChoices() {
  return Object.entries(FIELD_TYPES).map(([value, config]) => ({
    name: config.label,
    value,
  }));
}

/**
 * Create prompts for adding a single field
 * @param {number} fieldIndex - Index of the field (for display)
 * @returns {Array} Array of Inquirer prompts
 */
function createFieldPrompts(fieldIndex = 1) {
  return [
    {
      type: 'input',
      name: `field_${fieldIndex}_name`,
      message: `Field ${fieldIndex} - Name (camelCase, e.g., "firstName"):`,
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Field name is required';
        }
        if (!/^[a-z][a-zA-Z0-9]*$/.test(input)) {
          return 'Field name must be camelCase (start with lowercase letter)';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: `field_${fieldIndex}_type`,
      message: `Field ${fieldIndex} - Type:`,
      choices: getFieldTypeChoices(),
      default: 'string',
    },
    {
      type: 'confirm',
      name: `field_${fieldIndex}_required`,
      message: `Field ${fieldIndex} - Required?`,
      default: true,
    },
    {
      type: 'input',
      name: `field_${fieldIndex}_label`,
      message: `Field ${fieldIndex} - Label (for UI, leave empty for auto):`,
      default: '',
    },
  ];
}

/**
 * Create additional prompts based on field type
 * @param {string} fieldType - The selected field type
 * @param {number} fieldIndex - Index of the field
 * @returns {Array} Array of additional prompts
 */
function createTypeSpecificPrompts(fieldType, fieldIndex) {
  const typeConfig = FIELD_TYPES[fieldType];
  const prompts = [];

  if (typeConfig.hasMaxLength) {
    prompts.push({
      type: 'input',
      name: `field_${fieldIndex}_maxLength`,
      message: `Field ${fieldIndex} - Max length:`,
      default: typeConfig.defaultMaxLength?.toString() || '255',
      validate: (input) => {
        const num = parseInt(input, 10);
        return !isNaN(num) && num > 0 ? true : 'Must be a positive number';
      },
    });
  }

  if (typeConfig.hasMinMax) {
    prompts.push(
      {
        type: 'input',
        name: `field_${fieldIndex}_min`,
        message: `Field ${fieldIndex} - Minimum value (leave empty for none):`,
        default: '',
      },
      {
        type: 'input',
        name: `field_${fieldIndex}_max`,
        message: `Field ${fieldIndex} - Maximum value (leave empty for none):`,
        default: '',
      }
    );
  }

  if (typeConfig.hasDecimalPlaces) {
    prompts.push({
      type: 'input',
      name: `field_${fieldIndex}_decimalPlaces`,
      message: `Field ${fieldIndex} - Decimal places:`,
      default: '2',
    });
  }

  if (typeConfig.hasOptions) {
    prompts.push({
      type: 'input',
      name: `field_${fieldIndex}_options`,
      message: `Field ${fieldIndex} - Options (comma-separated, e.g., "active,pending,completed"):`,
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'At least one option is required';
        }
        return true;
      },
    });
  }

  if (typeConfig.hasRelation) {
    prompts.push({
      type: 'input',
      name: `field_${fieldIndex}_relatedModel`,
      message: `Field ${fieldIndex} - Related model (e.g., "User", "Category"):`,
      validate: (input) => {
        if (!input || input.trim() === '') {
          return 'Related model is required';
        }
        return true;
      },
    });
  }

  return prompts;
}

/**
 * Parse field answers into a structured field object
 * @param {Object} answers - Answers from prompts
 * @param {number} fieldIndex - Index of the field
 * @returns {Object} Parsed field object
 */
function parseFieldAnswer(answers, fieldIndex) {
  const prefix = `field_${fieldIndex}_`;
  const name = answers[`${prefix}name`];
  
  if (!name) return null;

  const field = {
    name,
    type: answers[`${prefix}type`] || 'string',
    required: answers[`${prefix}required`] !== false,
    label: answers[`${prefix}label`] || formatLabel(name),
  };

  // Add type-specific properties
  const typeConfig = FIELD_TYPES[field.type];

  if (typeConfig.hasMaxLength && answers[`${prefix}maxLength`]) {
    field.maxLength = parseInt(answers[`${prefix}maxLength`], 10);
  }

  if (typeConfig.hasMinMax) {
    if (answers[`${prefix}min`]) {
      field.min = parseFloat(answers[`${prefix}min`]);
    }
    if (answers[`${prefix}max`]) {
      field.max = parseFloat(answers[`${prefix}max`]);
    }
  }

  if (typeConfig.hasDecimalPlaces && answers[`${prefix}decimalPlaces`]) {
    field.decimalPlaces = parseInt(answers[`${prefix}decimalPlaces`], 10);
  }

  if (typeConfig.hasOptions && answers[`${prefix}options`]) {
    field.options = answers[`${prefix}options`]
      .split(',')
      .map((opt) => opt.trim())
      .filter(Boolean);
  }

  if (typeConfig.hasRelation && answers[`${prefix}relatedModel`]) {
    field.relatedModel = answers[`${prefix}relatedModel`];
  }

  return field;
}

/**
 * Format a camelCase name into a human-readable label
 * @param {string} name - camelCase field name
 * @returns {string} Human-readable label
 */
function formatLabel(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Generate frontend form field component code
 * @param {Object} field - Field configuration
 * @returns {string} JSX code for the form field
 */
function generateFormFieldCode(field) {
  const typeMapping = config.fieldTypes[field.type] || config.fieldTypes.string;
  const component = typeMapping.frontend.component;
  const inputType = typeMapping.frontend.inputType || 'text';

  let validationRules = [];
  
  if (field.required) {
    validationRules.push(`required: {
              value: true,
              message: intl.formatMessage({
                defaultMessage: '${field.label} is required',
                id: 'Form / ${field.name} required',
              }),
            }`);
  }

  if (field.maxLength) {
    validationRules.push(`maxLength: {
              value: ${field.maxLength},
              message: intl.formatMessage({
                defaultMessage: '${field.label} is too long',
                id: 'Form / ${field.name} max length error',
              }),
            }`);
  }

  if (field.min !== undefined) {
    validationRules.push(`min: {
              value: ${field.min},
              message: intl.formatMessage({
                defaultMessage: '${field.label} must be at least ${field.min}',
                id: 'Form / ${field.name} min error',
              }),
            }`);
  }

  if (field.max !== undefined) {
    validationRules.push(`max: {
              value: ${field.max},
              message: intl.formatMessage({
                defaultMessage: '${field.label} must be at most ${field.max}',
                id: 'Form / ${field.name} max error',
              }),
            }`);
  }

  const validationString = validationRules.length > 0 
    ? `{
            ${validationRules.join(',\n            ')}
          }`
    : '{}';

  if (component === 'Input') {
    return `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  {...register('${field.name}', ${validationString})}
                  type="${inputType}"
                  label={intl.formatMessage({
                    defaultMessage: '${field.label}:',
                    id: 'Form / ${field.name} label',
                  })}
                  placeholder={intl.formatMessage({
                    defaultMessage: '${field.label}',
                    id: 'Form / ${field.name} placeholder',
                  })}
                  error={errors.${field.name}?.message}
                />
              </FormControl>
            </FormItem>
          )}
        />`;
  }

  if (component === 'Textarea') {
    return `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <FormattedMessage defaultMessage="${field.label}" id="Form / ${field.name} label" />
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  {...register('${field.name}', ${validationString})}
                  placeholder={intl.formatMessage({
                    defaultMessage: '${field.label}',
                    id: 'Form / ${field.name} placeholder',
                  })}
                />
              </FormControl>
              {errors.${field.name} && (
                <p className="text-sm text-destructive">{errors.${field.name}.message}</p>
              )}
            </FormItem>
          )}
        />`;
  }

  if (component === 'Checkbox') {
    return `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                <FormattedMessage defaultMessage="${field.label}" id="Form / ${field.name} label" />
              </FormLabel>
            </FormItem>
          )}
        />`;
  }

  if (component === 'Select' && field.options) {
    const optionsCode = field.options
      .map((opt) => `<SelectItem value="${opt}">${formatLabel(opt)}</SelectItem>`)
      .join('\n                  ');

    return `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <FormattedMessage defaultMessage="${field.label}" id="Form / ${field.name} label" />
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={intl.formatMessage({
                      defaultMessage: 'Select ${field.label.toLowerCase()}',
                      id: 'Form / ${field.name} placeholder',
                    })} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  ${optionsCode}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />`;
  }

  // Default fallback
  return `<FormField
          control={form.control}
          name="${field.name}"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <FormattedMessage defaultMessage="${field.label}" id="Form / ${field.name} label" />
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />`;
}

/**
 * Generate Django model field code
 * @param {Object} field - Field configuration
 * @returns {string} Python code for the model field
 */
function generateModelFieldCode(field) {
  const typeMapping = config.fieldTypes[field.type] || config.fieldTypes.string;
  const modelField = typeMapping.backend.model;

  let fieldArgs = [];

  if (!field.required) {
    fieldArgs.push('blank=True');
    fieldArgs.push('null=True');
  }

  if (field.maxLength) {
    fieldArgs.push(`max_length=${field.maxLength}`);
  }

  if (field.min !== undefined || field.max !== undefined) {
    // Would need validators import
    if (field.min !== undefined) {
      fieldArgs.push(`validators=[MinValueValidator(${field.min})]`);
    }
    if (field.max !== undefined) {
      fieldArgs.push(`validators=[MaxValueValidator(${field.max})]`);
    }
  }

  if (field.decimalPlaces) {
    fieldArgs.push(`decimal_places=${field.decimalPlaces}`);
    fieldArgs.push('max_digits=10');
  }

  if (field.type === 'boolean') {
    fieldArgs.push(`default=${field.required ? 'False' : 'None'}`);
  }

  if (field.options) {
    const choices = field.options
      .map((opt) => `('${opt}', '${formatLabel(opt)}')`)
      .join(', ');
    fieldArgs.push(`choices=[${choices}]`);
  }

  if (field.relatedModel) {
    return `${field.name} = models.ForeignKey('${field.relatedModel}', on_delete=models.CASCADE${!field.required ? ', null=True, blank=True' : ''})`;
  }

  const argsString = fieldArgs.length > 0 ? fieldArgs.join(', ') : '';
  return `${field.name} = models.${modelField}(${argsString})`;
}

/**
 * Generate TypeScript interface for form fields
 * @param {Array} fields - Array of field configurations
 * @param {string} typeName - Name of the TypeScript type
 * @returns {string} TypeScript interface code
 */
function generateTypeScriptInterface(fields, typeName) {
  const fieldLines = fields.map((field) => {
    let tsType = 'string';
    
    switch (field.type) {
      case 'number':
      case 'decimal':
        tsType = 'number';
        break;
      case 'boolean':
        tsType = 'boolean';
        break;
      case 'date':
      case 'datetime':
        tsType = 'Date';
        break;
      case 'multiselect':
        tsType = 'string[]';
        break;
      case 'file':
      case 'image':
        tsType = 'File';
        break;
      default:
        tsType = 'string';
    }

    const optional = field.required ? '' : '?';
    return `  ${field.name}${optional}: ${tsType};`;
  });

  return `export type ${typeName} = {\n${fieldLines.join('\n')}\n};`;
}

/**
 * Generate GraphQL input type fields
 * @param {Array} fields - Array of field configurations
 * @returns {string} GraphQL input fields
 */
function generateGraphQLInputFields(fields) {
  return fields.map((field) => {
    let gqlType = 'String';
    
    switch (field.type) {
      case 'number':
        gqlType = 'Int';
        break;
      case 'decimal':
        gqlType = 'Float';
        break;
      case 'boolean':
        gqlType = 'Boolean';
        break;
      case 'date':
      case 'datetime':
        gqlType = 'DateTime';
        break;
      default:
        gqlType = 'String';
    }

    const required = field.required ? '!' : '';
    return `${field.name}: ${gqlType}${required}`;
  }).join('\n      ');
}

module.exports = {
  FIELD_TYPES,
  getFieldTypeChoices,
  createFieldPrompts,
  createTypeSpecificPrompts,
  parseFieldAnswer,
  formatLabel,
  generateFormFieldCode,
  generateModelFieldCode,
  generateTypeScriptInterface,
  generateGraphQLInputFields,
};
