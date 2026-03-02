// Stub for msw/browser - not needed for Storybook
// @vitest/mocker expects MSW 2.x but this project uses MSW 1.x

export const setupWorker = () => ({
  start: () => Promise.resolve(),
  stop: () => Promise.resolve(),
  use: () => {},
  resetHandlers: () => {},
  restoreHandlers: () => {},
  listHandlers: () => [],
});

export default { setupWorker };
