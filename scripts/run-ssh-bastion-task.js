#!/usr/bin/env node

const { spawn } = require('child_process');
const AWS = require('aws-sdk');
const { prop, indexBy, propEq } = require('ramda');

const ENV_STAGE = process.env.ENV_STAGE;
const PROJECT_NAME = process.env.PROJECT_NAME;
const SSH_PRIVATE_KEY = process.env.BASTION_SSH_PRIVATE_KEY;

const cloudFormation = new AWS.CloudFormation();
const ecs = new AWS.ECS();
const ec2 = new AWS.EC2();

function prefixResourceName(name) {
  return `${PROJECT_NAME}-${ENV_STAGE}-${name}`;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getOutputsFromStack(stackName) {
  const describeStackResult = await cloudFormation.describeStacks({
    StackName: prefixResourceName(stackName),
  }).promise();

  const { Outputs: outputs } = describeStackResult.Stacks[0];
  return indexBy(prop('ExportName'), outputs);
}

async function waitForTask({ cluster, taskArn, maxRetries = 100, retryCount = 0 }) {
  for (let i = 0; i < maxRetries; i += 1) {
    const describeTask = await ecs.describeTasks({
      cluster,
      tasks: [taskArn],
    }).promise();

    const { lastStatus } = describeTask.tasks[0];

    if (lastStatus === 'RUNNING') {
      return describeTask;
    }

    if (retryCount >= maxRetries) {
      throw new Error('Bastion setup timeout!');
    }

    console.log(`[${retryCount}] Waiting for bastion to start... (${lastStatus})`);
    await sleep(1000);
    retryCount += 1;
  }
}

async function stopTask({ cluster, task }) {
  console.log(`Stopping bastion task ${task}`);

  try {
    await ecs.stopTask({ cluster, task }).promise();
  } catch (err) {
    console.log(`Could not stop bastion task ${task}! \nMake sure you kill it manually to avoid unnecessary costs.`);
  }
}

(async function () {
  const bastionStackOutputs = await getOutputsFromStack('SshBastionStack');
  const mainStackOutputs = await getOutputsFromStack('MainStack');
  const { OutputValue: taskDefinitionArn } = bastionStackOutputs[prefixResourceName('sshBastionTaskDefinitionArn')];
  const { OutputValue: securityGroupId } = bastionStackOutputs[prefixResourceName('sshBastionSecurityGroupId')];
  const { OutputValue: fargateContainerSecurityGroupId } = mainStackOutputs[prefixResourceName('fargateContainerSecurityGroupId')];
  const { OutputValue: publicSubnetOneId } = mainStackOutputs[prefixResourceName('publicSubnetOneId')];
  const { OutputValue: publicSubnetTwoId } = mainStackOutputs[prefixResourceName('publicSubnetTwoId')];

  const cluster = prefixResourceName('main');
  const runTaskResult = await ecs.runTask({
    cluster,
    taskDefinition: taskDefinitionArn,
    launchType: 'FARGATE',
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: 'ENABLED',
        securityGroups: [fargateContainerSecurityGroupId, securityGroupId],
        subnets: [publicSubnetOneId, publicSubnetTwoId],
      },
    },
    count: 1,
  }).promise();
  const { taskArn } = runTaskResult.tasks[0];

  try {
    const describeTaskResult = await waitForTask({ cluster, taskArn });
    const eniAttachment = describeTaskResult.tasks[0].attachments.find(propEq('type', 'ElasticNetworkInterface'));
    const { value: networkInterfaceId } = eniAttachment.details.find(propEq('name', 'networkInterfaceId'));
    const describeNetworkInterfacesResult = await ec2.describeNetworkInterfaces({
      NetworkInterfaceIds: [networkInterfaceId],
    }).promise();

    const { PublicIp: publicIp } = describeNetworkInterfacesResult.NetworkInterfaces[0].Association;

    console.log('Connecting to SSH bastion using');
    const sshCmd = spawn('ssh', ['-i', SSH_PRIVATE_KEY, `root@${publicIp}`], { stdio: 'inherit' });
    sshCmd.on('close', async () => {
      await stopTask({ cluster, task: taskArn });
    });
  } catch (err) {
    console.error(err);
    await stopTask({ cluster, task: taskArn });
  }
})();
