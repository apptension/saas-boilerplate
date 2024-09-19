module.exports = {
  bumpFiles: [
    {
      filename: './package.json',
      type: 'json',
    },
    {
      filename: './packages/backend/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-api-client/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-contentful/package.json',
      type: 'json',
    },

    {
      filename: './packages/webapp-libs/webapp-core/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-crud-demo/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-documents/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-emails/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-finances/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-generative-ai/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-notifications/package.json',
      type: 'json',
    },
    {
      filename: './packages/webapp-libs/webapp-tenants/package.json',
      type: 'json',
    },

    {
      filename: './packages/workers/package.json',
      type: 'json',
    },
    {
      filename: './packages/contentful/package.json',
      type: 'json',
    },
    {
      filename: './packages/internal/core/package.json',
      type: 'json',
    },
    {
      filename: './packages/internal/cli/package.json',
      type: 'json',
    },
    {
      filename: './packages/internal/docs/core.json',
      type: 'json',
    },
    {
      filename: './packages/internal/docs/package.json',
      type: 'json',
    },
    {
      filename: './packages/internal/status-dashboard/package.json',
      type: 'json',
    },
    {
      filename: './packages/internal/tools/package.json',
      type: 'json',
    },
    {
      filename: './packages/infra/infra-core/package.json',
      type: 'json',
    },
    {
      filename: './packages/infra/infra-shared/package.json',
      type: 'json',
    },
  ],
  tagPrefix: '',
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'deps', section: 'Dependencies' },
    { type: 'chore', hidden: true },
    { type: 'docs', hidden: true },
    { type: 'style', hidden: true },
    { type: 'refactor', hidden: true },
    { type: 'perf', hidden: true },
    { type: 'test', hidden: true },
  ],
};
