import { CodeBuild } from '@aws-sdk/client-codebuild';
import globToRegExp from 'glob-to-regexp';

export const handler = async (event) => {
  console.log('Start trigger entrypoint', { event });

  const codebuild = new CodeBuild({ region: process.env.AWS_DEFAULT_REGION });
  const branches = process.env.DEPLOY_BRANCHES?.split(',') ?? [];
  const projectName = process.env.PROJECT_NAME;
  if (!projectName) {
    throw 'Invalid project name';
  }
  const {
    detail: { referenceName },
  } = event;
  // check if referenceName is in branches
  const filteredBranches = branches
    .map((branch) => ({
      branch,
      regex: globToRegExp(branch, { globstar: true }),
    }))
    .filter((pattern) => pattern.regex.test(referenceName));

  if (filteredBranches.length > 0) {
    console.log('Trigger deploy:', referenceName, filteredBranches[0]);
    await codebuild
      .startBuild({
        projectName,
        sourceVersion: referenceName,
      })
      .then((response) => {
        console.log('Codebuild started!', response);
      })
      .catch((error) => {
        console.log('Run codebuild error', error);
      });
  }

  return { event, branches, filteredBranches };
};
