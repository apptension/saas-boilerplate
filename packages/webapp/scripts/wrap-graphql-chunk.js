const fs = require('fs').promises;

const fileName = process.argv[2];
const destPath = process.argv[3];

(async () => {
  const contents = await fs.readFile(fileName);
  const schema = contents.toString();
  await fs.writeFile(destPath, `export default ${JSON.stringify(schema, null, 2)}`);
})();
