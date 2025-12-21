/**
 * PLOP Generator Configuration
 * 
 * Configure post-generation automation and generator behavior.
 * These settings can be overridden per-generator or per-run.
 */

module.exports = {
  /**
   * Post-generation actions configuration
   */
  postActions: {
    // Auto-format generated files with Prettier
    format: true,

    // Auto-run GraphQL codegen after generating GraphQL files
    codegen: true,

    // Download GraphQL schema from backend (requires backend running)
    downloadSchema: false,

    // Restart development servers after generation
    restartServers: false,

    // Open generated files in editor
    openInEditor: true,
  },

  /**
   * Editor configuration
   */
  editor: {
    // Command to open editor (code = VS Code, cursor = Cursor, etc.)
    command: 'code',

    // Maximum number of files to open at once
    maxFiles: 5,
  },

  /**
   * Preview mode settings
   */
  preview: {
    // Show preview before generating (ask for confirmation)
    enabled: true,

    // Show estimated file sizes
    showSizes: false,

    // Show full file tree
    showTree: true,
  },

  /**
   * Conflict detection settings
   */
  conflicts: {
    // Check for existing files before generating
    checkFiles: true,

    // Check for route name conflicts
    checkRoutes: true,

    // Action when conflict detected: 'abort', 'skip', 'overwrite', 'ask'
    onConflict: 'ask',
  },

  /**
   * Backend generator settings
   */
  backend: {
    // Path to Django apps directory (relative to workspace root)
    appsPath: 'packages/backend/apps',

    // Auto-run migrations after generating backend code
    autoMigrate: false,

    // Default to tenant-dependent models
    defaultTenantDependent: true,
  },

  /**
   * Frontend generator settings
   */
  frontend: {
    // Default path for new routes (relative to webapp/src)
    routesPath: 'routes',

    // Default path for components
    componentsPath: 'shared/components',

    // Include stories by default
    includeStories: true,

    // Include tests by default
    includeTests: true,
  },

  /**
   * Field type mappings for form/model generation
   * Maps field types to their frontend and backend representations
   */
  fieldTypes: {
    string: {
      frontend: { component: 'Input', validation: 'string' },
      backend: { model: 'CharField', serializer: 'CharField' },
    },
    text: {
      frontend: { component: 'Textarea', validation: 'string' },
      backend: { model: 'TextField', serializer: 'CharField' },
    },
    number: {
      frontend: { component: 'Input', inputType: 'number', validation: 'number' },
      backend: { model: 'IntegerField', serializer: 'IntegerField' },
    },
    decimal: {
      frontend: { component: 'Input', inputType: 'number', validation: 'number' },
      backend: { model: 'DecimalField', serializer: 'DecimalField' },
    },
    boolean: {
      frontend: { component: 'Checkbox', validation: 'boolean' },
      backend: { model: 'BooleanField', serializer: 'BooleanField' },
    },
    date: {
      frontend: { component: 'DatePicker', validation: 'date' },
      backend: { model: 'DateField', serializer: 'DateField' },
    },
    datetime: {
      frontend: { component: 'DateTimePicker', validation: 'date' },
      backend: { model: 'DateTimeField', serializer: 'DateTimeField' },
    },
    email: {
      frontend: { component: 'Input', inputType: 'email', validation: 'email' },
      backend: { model: 'EmailField', serializer: 'EmailField' },
    },
    url: {
      frontend: { component: 'Input', inputType: 'url', validation: 'url' },
      backend: { model: 'URLField', serializer: 'URLField' },
    },
    select: {
      frontend: { component: 'Select', validation: 'string' },
      backend: { model: 'CharField', serializer: 'ChoiceField' },
    },
    file: {
      frontend: { component: 'FileInput', validation: 'file' },
      backend: { model: 'FileField', serializer: 'FileField' },
    },
    image: {
      frontend: { component: 'ImageInput', validation: 'file' },
      backend: { model: 'ImageField', serializer: 'ImageField' },
    },
  },
};
