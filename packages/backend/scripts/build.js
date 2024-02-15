const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');

const { runCommand } = require('./lib/runCommand');

const AWS_REGION = process.env.AWS_REGION;
const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;
const PROJECT_NAME = process.env.PROJECT_NAME;
const VERSION = process.env.VERSION;
const SB_MIRROR_REPOSITORY = process.env.SB_MIRROR_REPOSITORY ?? '';
const SB_PULL_THROUGH_CACHE_REPOSITORY =
  process.env.SB_PULL_THROUGH_CACHE_REPOSITORY ?? '';

const stsClient = new STSClient();

(async () => {
  try {
    const getCallerIdentityCommand = new GetCallerIdentityCommand();
    const { Account: AWS_ACCOUNT_ID } = await stsClient.send(
      getCallerIdentityCommand,
    );
    const region = AWS_REGION || AWS_DEFAULT_REGION;
    const BACKEND_REPO_URI = `${AWS_ACCOUNT_ID}.dkr.ecr.${region}.amazonaws.com/${PROJECT_NAME}-backend`;

    try {
      await runCommand('docker', ['pull', `${BACKEND_REPO_URI}:latest`]);
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
    }

    await runCommand('docker', [
      'build',
      '--platform',
      'linux/amd64',
      '--target',
      'backend',
      '-t',
      `${BACKEND_REPO_URI}:${VERSION}`,
      '--build-arg',
      `SB_MIRROR_REPOSITORY=${SB_MIRROR_REPOSITORY}`,
      '--build-arg',
      `SB_PULL_THROUGH_CACHE_REPOSITORY=${SB_PULL_THROUGH_CACHE_REPOSITORY}`,
      '.',
    ]);

    await runCommand('docker', ['push', `${BACKEND_REPO_URI}:${VERSION}`]);
    await runCommand('docker', [
      'tag',
      `${BACKEND_REPO_URI}:${VERSION}`,
      `${BACKEND_REPO_URI}:latest`,
    ]);
    await runCommand('docker', ['push', `${BACKEND_REPO_URI}:latest`]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
