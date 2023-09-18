#!/usr/bin/env node

const { spawn } = require('node:child_process');

spawn(
  'git',
  [
    'describe',
    '--tags',
    '--first-parent',
    '--abbrev=11',
    '--long',
    '--dirty',
    '--always',
  ],
  { stdio: 'inherit' }
);
