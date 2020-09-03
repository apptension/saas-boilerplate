#!/usr/bin/env node

const URL = require('url');
const AWS = require('aws-sdk');
const { prop, indexBy } = require('ramda');

const PROJECT_NAME = process.env.PROJECT_NAME;

const cloudFormation = new AWS.CloudFormation();
const iam = new AWS.IAM();

function prefixGlobalResourceName(name) {
  return `${PROJECT_NAME}-${name}`;
}

async function getOutputsFromGlobalStack(stackName) {
  const describeStackResult = await cloudFormation.describeStacks({
    StackName: prefixGlobalResourceName(stackName),
  }).promise();

  const { Outputs: outputs } = describeStackResult.Stacks[0];
  return indexBy(prop('ExportName'), outputs);
}


(async function () {
  const globalStackOutputs = await getOutputsFromGlobalStack('GlobalStack');
  const { OutputValue: repoUserName } = globalStackOutputs[prefixGlobalResourceName('codeRepoUserName')];
  const { OutputValue: repoUrl } = globalStackOutputs[prefixGlobalResourceName('codeRepoCloneUrlHttp')];

  const response = await iam.createServiceSpecificCredential({
    UserName: repoUserName,
    ServiceName: 'codecommit.amazonaws.com',
  }).promise();

  const { ServicePassword: password, ServiceUserName: userName } = response.ServiceSpecificCredential;

  const urlParts = URL.parse(repoUrl);
  urlParts.auth = `${userName}:${password}`;

  console.log(URL.format(urlParts));
})();
