#!/usr/bin/env bash

const { ECSClient, ListTasksCommand } = require('@aws-sdk/client-ecs');

const { runCommand } = require('./lib/runCommand');

const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;
const ENV_STAGE = process.env.ENV_STAGE;
const PROJECT_NAME = process.env.PROJECT_NAME;

const projectEnvName = `${PROJECT_NAME}-${ENV_STAGE}`;
const clusterName = `${projectEnvName}-main`;
const serviceName = `${projectEnvName}-api`;

const ecsClient = new ECSClient();

(async () => {
  try {
    if (!ENV_STAGE) {
      console.error('ENV_STAGE environment variable is not set');
      process.exit(1);
    }

    const taskList = await ecsClient.send(
      new ListTasksCommand({
        cluster: clusterName,
        serviceName: serviceName,
      })
    );

    const taskArn = taskList.taskArns[0];

    await runCommand('aws', [
      'ecs',
      'execute-command',
      '--cluster',
      clusterName,
      '--region',
      AWS_DEFAULT_REGION,
      '--task',
      taskArn,
      '--container',
      'backend',
      '--command',
      '/bin/bash',
      '--interactive',
    ]);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
})();
