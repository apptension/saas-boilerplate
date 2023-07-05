const fs = require('fs').promises;
const path = require('path');
const { runMigration } = require('contentful-migration');

require('dotenv').config();

const defaultOptions = {
  spaceId: process.env.CONTENTFUL_SPACE_ID,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  environmentId: process.env.CONTENTFUL_ENVIRONMENT,
  yes: true,
};

async function runFile(filePath) {
  return await runMigration({
    ...defaultOptions,
    filePath: filePath,
  });
}

async function run() {
  const migrationsDir = path.join(__dirname, '../migrations');
  const files = await fs.readdir(migrationsDir);
  const sortedFiles = files.sort((a, b) => {
    const extractNum = (name) => parseInt(name.substring(0, 4), 10);
    return extractNum(a) - extractNum(b);
  });

  await Promise.all(
    sortedFiles.map((fileName) => runFile(path.join(migrationsDir, fileName)))
  );
}

(async () => {
  try {
    await run();
    console.log('Migration Done!');
  } catch (e) {
    console.error(e);
  }
})();
