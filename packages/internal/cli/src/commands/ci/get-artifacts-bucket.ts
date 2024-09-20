import {
  CloudFormationClient,
  DescribeStacksCommand,
} from '@aws-sdk/client-cloudformation';
import { indexBy, prop } from 'ramda';

import { initConfig } from '../../config/init';
import { BaseCommand } from '../../baseCommand';

type GetOutputsFromStackOptions = {
  stackName: string;
};
async function getOutputsFromStack({ stackName }: GetOutputsFromStackOptions) {
  const client = new CloudFormationClient();
  const describeStackResult = await client.send(
    new DescribeStacksCommand({ StackName: stackName }),
  );
  const stack = describeStackResult?.Stacks?.[0];
  return indexBy(prop('ExportName'), stack?.Outputs ?? []);
}

export default class CiGetArtifactsBucket extends BaseCommand<
  typeof CiGetArtifactsBucket
> {
  static description =
    'Returns name of the bucket that external-ci user can upload code artifact to trigger a deployment';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  static flags = {};

  async run(): Promise<void> {
    const { projectEnvName } = await initConfig(this, {
      requireAws: true,
      skipERCLogin: true,
    });

    const globalStackOutputs = await getOutputsFromStack({
      stackName: `${projectEnvName}-CiStack`,
    });
    const { OutputValue: artifactsBucketName } =
      globalStackOutputs[`${projectEnvName}-artifactsBucketName`] ?? {};

    if (!artifactsBucketName) {
      this.error('Failed to fetch bucket name');
    }

    this.log(`Bucket name: ${artifactsBucketName}`);
  }
}
