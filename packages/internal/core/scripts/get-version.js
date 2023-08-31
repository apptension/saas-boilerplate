#!/usr/bin/env node

const { spawn } = require('node:child_process');

const username = process.env.DOCKER_USERNAME || '';
const password = process.env.DOCKER_PASSWORD || '';

if (username && password) {
    spawn('docker', [
        'login',
        '-u', `"${username}"`,
        '-p', `"${password}"`,
    ], {stdio: 'inherit'});
}
