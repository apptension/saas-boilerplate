#!/usr/bin/env node

const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const projectName = process.env.PROJECT_NAME;
const volumeName = `${projectName}-web-backend-db-data`;

(async () => {
    const { stdout, stderr } = await exec(`docker volume create --name="${volumeName}"`);
    console.log(stdout);
    console.error(stderr);
})();
