const { uniq } = require('ramda');
const util = require('util');
const terminalLink = require('terminal-link');
const chalk = require('react-dev-utils/chalk');
const exec = util.promisify(require('child_process').exec);

let hasError = false;

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

    Object.entries(groupedLinesRecord).forEach(([path, errors]) => {
      const link = generateLink(`${process.cwd()}/${path}`);
      const formattedErrors = uniq(errors)
        .map((error) => `  ${error}`)
        .join('\n');
      console.log(link);
      console.log(formattedErrors, '\n');
    });
  }
};

const runESlintCheck = async () => {
  try {
    const { stdout } = await exec('eslint . --fix');
    const lines = stdout
      .split('\n')
      .map((line) => {
        if (line.includes(process.cwd())) {
          hasError = true;
          return generateLink(line);
        }
        return line;
      })
      .filter((line) => !line.includes('✖ '))
      .join('\n');
    console.log(lines);
  } catch (error) {
    hasError = true;
    console.log(error);
  }
};

(async () => {
  await runTSCheck();
  await runESlintCheck();

  if (hasError) {
    console.log(chalk.red('Houston, we have a problem! 🚨'));
    process.exit(1);
  } else {
    console.log(chalk.green('Ready to go! 🚀'));
    process.exit(0);
  }
})();
