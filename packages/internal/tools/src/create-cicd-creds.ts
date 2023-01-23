import * as URL from 'url';
import * as AWS from 'aws-sdk';
import { indexBy, prop } from 'ramda';

const PROJECT_NAME = process.env.PROJECT_NAME;

const cloudFormation = new AWS.CloudFormation();
const iam = new AWS.IAM();

function prefixGlobalResourceName(name) {
  return `${PROJECT_NAME}-${name}`;
}

export default async function getOutputsFromGlobalStack(stackName) {
  const describeStackResult = await cloudFormation
    .describeStacks({
      StackName: prefixGlobalResourceName(stackName),
    })
    .promise();

  const stack = describeStackResult?.Stacks?.[0];
  return indexBy(prop('ExportName'), stack?.Outputs ?? []);
}

(async function () {
  const globalStackOutputs = await getOutputsFromGlobalStack('GlobalStack');
  const { OutputValue: repoUserName } =
    globalStackOutputs[prefixGlobalResourceName('codeRepoUserName')] ?? {};
  const { OutputValue: repoUrl } =
    globalStackOutputs[prefixGlobalResourceName('codeRepoCloneUrlHttp')] ?? {};

  if (!repoUserName || !repoUrl) {
    console.error('Failed to fetch repository username and URL');
    return;
  }

  const response = await iam
    .createServiceSpecificCredential({
      UserName: repoUserName,
      ServiceName: 'codecommit.amazonaws.com',
    })
    .promise();

  if (!response.ServiceSpecificCredential) {
    console.error('Failed to create service specific credentials');
    return;
  }

  const { ServicePassword: password, ServiceUserName: userName } =
    response.ServiceSpecificCredential;

  const urlParts = URL.parse(repoUrl);
  urlParts.auth = `${userName}:${password}`;

  console.log(URL.format(urlParts));
})();
