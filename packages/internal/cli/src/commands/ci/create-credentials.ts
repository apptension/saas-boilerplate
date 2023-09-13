import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import {
  CreateServiceSpecificCredentialCommand,
  IAMClient,
} from '@aws-sdk/client-iam';
import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';
import { indexBy, prop } from 'ramda';
import * as URL from 'url';

import { initConfig } from '../../config/init';

const tracer = trace.getTracer('ci');

type GetOutputsFromGlobalStackOptions = {
  stackName: string;
};
async function getOutputsFromGlobalStack({
  stackName,
}: GetOutputsFromGlobalStackOptions) {
  const client = new CloudFormationClient();
  const describeStackResult = await client.send(
    new DescribeStacksCommand({ StackName: stackName })
  );
  const stack = describeStackResult?.Stacks?.[0];
  return indexBy(prop('ExportName'), stack?.Outputs ?? []);
}

type CreateCredentialsOptions = {
  repoUserName: string;
};
function createCredentials({ repoUserName }: CreateCredentialsOptions) {
  const client = new IAMClient();

  return client.send(
    new CreateServiceSpecificCredentialCommand({
      UserName: repoUserName,
      ServiceName: 'codecommit.amazonaws.com',
    })
  );
}

export default class CiCreateCredentials extends Command {
  static description =
    'Create CI/CD repository credentials. They can be used in Bitbucket, Github, Gitlab, etc ' +
    'to push code changes to CodeCommit';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {};

  async run(): Promise<void> {
    return tracer.startActiveSpan('create-credentials', async (span) => {
      const { flags } = await this.parse(CiCreateCredentials);
      const { projectName } = await initConfig(this, { requireAws: true });

      const globalStackOutputs = await getOutputsFromGlobalStack({
        stackName: `${projectName}-GlobalStack`,
      });
      const { OutputValue: repoUserName } =
        globalStackOutputs[`${projectName}-codeRepoUserName`] ?? {};
      const { OutputValue: repoUrl } =
        globalStackOutputs[`${projectName}-codeRepoCloneUrlHttp`] ?? {};

      if (!repoUserName || !repoUrl) {
        this.error('Failed to fetch repository username and URL');
      }

      const response = await createCredentials({ repoUserName });

      if (!response.ServiceSpecificCredential) {
        this.error('Failed to create service specific credentials');
      }

      const { ServicePassword: password, ServiceUserName: userName } =
        response.ServiceSpecificCredential;

      const urlParts = URL.parse(repoUrl);
      urlParts.auth = `${userName}:${password}`;

      this.log(URL.format(urlParts));
      span.end();
    });
  }
}
