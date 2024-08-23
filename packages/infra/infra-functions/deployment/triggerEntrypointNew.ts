import { CodeBuild } from '@aws-sdk/client-codebuild';
import { APIGatewayEvent } from 'aws-lambda';

// Function that is called from the GH action
export const handler = async (event: APIGatewayEvent) => {
  console.log('Start trigger entrypoint', { event });

  const codebuild = new CodeBuild({ region: process.env.AWS_DEFAULT_REGION });
  const projectName = process.env.PROJECT_NAME;
  const webhookSecret = process.env.WEBHOOK_SECRET || '';

  const { queryStringParameters, body } = event;

  if (!projectName || !webhookSecret) {
    throw new Error('Invalid environment configuration name');
  }

  if (webhookSecret && queryStringParameters?.secret !== webhookSecret) {
    throw new Error('Invalid secret');
  }

  let referenceName: string, deployTarget: string;

  try {
    const payload = JSON.parse(body || '');
    referenceName = payload?.referenceName;
    deployTarget = payload?.deployTarget;
  } catch (error) {
    throw new Error('Invalid payload');
  }

  if (!referenceName) {
    throw new Error('Invalid reference name');
  }

  const codebuildProjectName = `${projectName}-${deployTarget}`;
  console.log('Trigger deploy:', codebuildProjectName, referenceName);
  await codebuild
    .startBuild({
      projectName: codebuildProjectName,
      environmentVariablesOverride: [
        {
          name: 'GIT_CLONE_REFERENCE',
          value: referenceName,
        },
      ],
    })
    .then((response) => {
      console.log('Codebuild started!', response);
    })
    .catch((error) => {
      console.log('Run codebuild error', error);
    });

  return {
    statusCode: 200,
    body: JSON.stringify({ codebuildProjectName, referenceName }),
  };
};
