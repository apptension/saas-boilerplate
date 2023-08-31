const { spawn } = require('child_process');
const {
  ECRClient,
  GetAuthorizationTokenCommand,
} = require('@aws-sdk/client-ecr');
const {
  STSClient,
  GetCallerIdentityCommand,
} = require('@aws-sdk/client-sts');

const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;
const PROJECT_NAME = process.env.PROJECT_NAME;
const VERSION = process.env.VERSION;
const BACKEND_BASE_IMAGE = process.env.BACKEND_BASE_IMAGE;

const stsClient = new STSClient();
const ecrClient = new ECRClient();

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {stdio: 'inherit'});

    child.on('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(`"${command} ${args.join(' ')}" failed with code ${code}`)
        );
      } else {
        resolve();
      }
    });
  });
}

(async () => {
  try {
    const getCallerIdentityCommand = new GetCallerIdentityCommand();
    const { Account: AWS_ACCOUNT_ID } = await stsClient.send(getCallerIdentityCommand);
    const BACKEND_REPO_URI = `${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/${PROJECT_NAME}-backend`;

    try {
      const getAuthorizationTokenCommand = new GetAuthorizationTokenCommand();
      const { authorizationData } = await ecrClient.send(
        getAuthorizationTokenCommand
      );
      const decodedAuthToken = Buffer.from(
        authorizationData[0].authorizationToken,
        'base64'
      ).toString('utf8');
      const password = decodedAuthToken.split(':')[1];

      await runCommand(
        'docker',
        ['login', '--username', 'AWS', '-p', password, BACKEND_REPO_URI]
      );
    } catch (error) {
      console.error(error);
      console.warn(
        'get-login-password not supported by the AWS CLI, trying get-login instead...'
      );
      await runCommand('aws', [
        'ecr',
        'get-login',
        '--no-include-email',
        '--region',
        AWS_DEFAULT_REGION,
      ]);
    }

    try {
      await runCommand('docker', ['pull', `${BACKEND_REPO_URI}:latest`]);
    } catch (error) {
      console.warn(`Warning: ${error.message}`);
    }

    if (BACKEND_BASE_IMAGE) {
      await runCommand('docker', [
        'build',
        '--target',
        'backend',
        '-t',
        `${BACKEND_REPO_URI}:${VERSION}`,
        '--build-arg',
        `BACKEND_BASE_IMAGE=${BACKEND_BASE_IMAGE}`,
        '.',
      ]);
    } else {
      await runCommand('docker', [
        'build',
        '--target',
        'backend',
        '-t',
        `${BACKEND_REPO_URI}:${VERSION}`,
        '.',
      ]);
    }

    await runCommand('docker', ['push', `${BACKEND_REPO_URI}:${VERSION}`]);
    await runCommand('docker', [
      'tag',
      `${BACKEND_REPO_URI}:${VERSION}`,
      `${BACKEND_REPO_URI}:latest`,
    ]);
    await runCommand('docker', ['push', `${BACKEND_REPO_URI}:latest`]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
