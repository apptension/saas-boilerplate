// Stub for msw/core/http - not needed for Storybook
// @vitest/mocker expects MSW 2.x but this project uses MSW 1.x

export const http = {
  get: () => ({}),
  post: () => ({}),
  put: () => ({}),
  patch: () => ({}),
  delete: () => ({}),
  head: () => ({}),
  options: () => ({}),
  all: () => ({}),
};

export default { http };
