// Stub for @storybook/addon-actions
// Provides a simple implementation for Storybook 10 compatibility

/**
 * Creates an action handler that logs to console and Storybook actions panel
 */
export const action = (name: string) => {
  return (...args: unknown[]) => {
    console.log(`[Action: ${name}]`, ...args);
  };
};

/**
 * Creates multiple action handlers
 */
export const actions = (...names: string[]) => {
  const result: Record<string, (...args: unknown[]) => void> = {};
  for (const name of names) {
    result[name] = action(name);
  }
  return result;
};
