const { readFileSync, realpathSync } = require('fs');
const { join, dirname } = require('path');

module.exports = () => {
  const cwd = process.cwd();
  const scriptsBinPath = join(cwd, '/node_modules/.bin/react-scripts');

  if (process.platform === 'win32') {
    /*
     * Try to find the scripts package on Windows by following the `react-scripts` CMD file.
     * https://github.com/storybookjs/storybook/issues/5801
     */
    try {
      const content = readFileSync(scriptsBinPath, 'utf8');
      // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
      const packagePathMatch = content.match(/"\$basedir[\\/](\S+?)[\\/]bin[\\/]react-scripts\.js"/i);

      if (packagePathMatch && packagePathMatch.length > 1) {
        return join(cwd, '/node_modules/.bin/', packagePathMatch[1]);
      }
    } catch (e) {
      // NOOP
    }
  } else {
    /*
     * Try to find the scripts package by following the `react-scripts` symlink.
     * This won't work for Windows users, unless within WSL.
     */
    try {
      const resolvedBinPath = realpathSync(scriptsBinPath);
      return join(resolvedBinPath, '..', '..');
    } catch (e) {
      // NOOP
    }
  }

  /*
   * Try to find the `react-scripts` package by name (won't catch forked scripts packages).
   */
  try {
    return dirname(require.resolve('react-scripts/package.json'));
  } catch (e) {
    // NOOP
  }

  return '';
};
