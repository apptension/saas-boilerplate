#!/usr/bin/env node
/**
 * Build script for MCP Server Docker image
 * Builds and pushes the image to AWS ECR
 *
 * Required environment variables:
 * - PROJECT_NAME: Name of the project
 * - VERSION: Version tag for the image
 * - AWS_REGION or AWS_DEFAULT_REGION: AWS region
 */

const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const { spawn } = require('node:child_process');
const path = require('path');

const AWS_REGION = process.env.AWS_REGION;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;
const PROJECT_NAME = process.env.PROJECT_NAME;
const VERSION = process.env.VERSION;

const ROOT_DIR = path.resolve(__dirname, '../../../..');

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const cmd = spawn(command, args, { ...options, stdio: 'inherit' });

    cmd.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`"${command} ${args.join(' ')}" failed with code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

const stsClient = new STSClient();

(async () => {
  try {
    if (!PROJECT_NAME) {
      throw new Error('PROJECT_NAME environment variable is required');
    }
    if (!VERSION) {
      throw new Error('VERSION environment variable is required');
    }

    const getCallerIdentityCommand = new GetCallerIdentityCommand();
    const { Account: AWS_ACCOUNT_ID } = await stsClient.send(getCallerIdentityCommand);
    const region = AWS_REGION || AWS_DEFAULT_REGION;

    if (!region) {
      throw new Error('AWS_REGION or AWS_DEFAULT_REGION environment variable is required');
    }

    const MCP_SERVER_REPO_URI = `${AWS_ACCOUNT_ID}.dkr.ecr.${region}.amazonaws.com/${PROJECT_NAME}-mcp-server`;

    console.log(`\n🤖 Building MCP Server`);
    console.log(`   Repository: ${MCP_SERVER_REPO_URI}`);
    console.log(`   Version: ${VERSION}\n`);

    // Try to pull existing latest image for cache
    try {
      console.log('📥 Pulling existing image for cache...');
      await runCommand('docker', ['pull', `${MCP_SERVER_REPO_URI}:latest`]);
    } catch (error) {
      console.warn(`   Warning: Could not pull existing image (this is normal for first build)`);
    }

    // Build the image
    console.log('\n📦 Building Docker image...');
    await runCommand('docker', [
      'build',
      '--platform', 'linux/amd64',
      '-f', 'packages/infra/mcp-server/Dockerfile',
      '-t', `${MCP_SERVER_REPO_URI}:${VERSION}`,
      '--cache-from', `${MCP_SERVER_REPO_URI}:latest`,
      '.',
    ], { cwd: ROOT_DIR });

    // Push the versioned image
    console.log('\n📤 Pushing Docker image...');
    await runCommand('docker', ['push', `${MCP_SERVER_REPO_URI}:${VERSION}`]);

    // Tag and push as latest
    await runCommand('docker', ['tag', `${MCP_SERVER_REPO_URI}:${VERSION}`, `${MCP_SERVER_REPO_URI}:latest`]);
    await runCommand('docker', ['push', `${MCP_SERVER_REPO_URI}:latest`]);

    console.log(`\n✅ Successfully built and pushed: ${MCP_SERVER_REPO_URI}:${VERSION}\n`);
  } catch (error) {
    console.error(`\n❌ Build failed: ${error.message}\n`);
    process.exit(1);
  }
})();
