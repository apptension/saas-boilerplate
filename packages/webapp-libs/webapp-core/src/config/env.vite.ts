/**
 * Vite environment helper.
 * This file is mocked in Jest tests via moduleNameMapper.
 * 
 * In Jest, this entire module is replaced with a mock that returns test values.
 * In Vite, import.meta.env is statically replaced at build time.
 */

 
const viteEnv = (import.meta as any).env || {};

export const getViteEnv = () => viteEnv;
