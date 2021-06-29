const { uniq, isEmpty } = require('ramda');
const util = require('util');
const path = require('path');
const terminalLink = require('terminal-link');
const chalk = require('react-dev-utils/chalk');
const exec = util.promisify(require('child_process').exec);

const errors = [];

const generateLink = (absolutePath) => {
  const cwd = process.cwd();
  const relativePath = absolutePath.slice(cwd.length);
  const fullLink = `file://${absolutePath}`;
  let link = fullLink;
  if (terminalLink.isSupported) {
    link = terminalLink(relativePath, fullLink);
  } else if (['--relative', '-R'].some((arg) => process.argv.includes(arg))) {
    link = relativePath;
  }

  return `${chalk.red('ERROR')} ${link}`;
};

const runTSCheck = async () => {
  try {
    await exec('tsc --noEmit --pretty false');
  } catch (error) {
    const { stdout } = error;
    const groupedLinesRecord = stdout
      .split('\n')
      .map((line) => {
        const regex = new RegExp(/^(?<path>.+)(?<lines>\(.+\):) error (?<errorContent>.+)/gm);
        const result = regex.exec(line);
        if (result && result.groups) {
          const { path, lines, errorContent } = result.groups;
          if (path && lines && errorContent) {
            return { path, lines, errorContent };
          }
        }
        return undefined;
      })
      .filter((result) => result !== undefined)
      .reduce((record, group) => {
        const items = record[group.path] !== undefined ? record[group.path] : [];
        return {
          ...record,
          [group.path]: [...items, group.errorContent],
        };
      }, {});

    const lines = Object.entries(groupedLinesRecord).map(([relativePath, errors]) => {
      const absolutePath = path.join(process.cwd(), relativePath);
      const link = generateLink(absolutePath);
      const formattedErrors = uniq(errors)
        .map((error) => `  ${error}`)
        .join('\n');
      return [link, formattedErrors, ''].join('\n');
    });

    errors.push(lines);
  }
};

const runESlintCheck = async () => {
  try {
    const { stdout } = await exec('eslint . --fix');

    const lines = stdout
      .split('\n')
      .slice(1, -2)
      .map((line) => {
        if (line.includes(process.cwd())) {
          return generateLink(line);
        }
        return line;
      })
      .filter((line) => !line.includes('✖ '));

    if (lines.some((line) => line !== '')) {
      errors.push(lines.join('\n'));
    }
  } catch (error) {
    errors.push(error);
  }
};

const runStylelintCheck = async () => {
  try {
    await exec("stylelint './src/**/*.ts'");
  } catch (error) {
    const lines = error.stdout
      .split('\n')
      .slice(1, -1)
      .map((line) => {
        if (line.includes('src') && line.includes('.ts')) {
          const absoluteLink = path.join(process.cwd(), line);
          return generateLink(absoluteLink);
        }
        if (line.includes('✖')) {
          return line.slice(line.indexOf('✖') + 1);
        }
        return line;
      })
      .join('\n');

    errors.push(lines);
  }
};

(async () => {
  await Promise.all([runTSCheck(), runESlintCheck(), runStylelintCheck()]);

  if (!isEmpty(errors)) {
    console.log(errors.join('\n'));
    console.log(chalk.red('Houston, we have a problem! 🚨'));
    process.exit(1);
  } else {
    console.log(chalk.green('Ready to go! 🚀'));
    process.exit(0);
  }
})();
