import { runCommand } from './runCommand';

type RunSecretsEditorOptions = {
  serviceName: string;
};

export const runSecretsEditor = async ({
  serviceName,
}: RunSecretsEditorOptions) => {
  await runCommand('pnpm', ['nx', 'run', 'ssm-editor:compose-build-image']);
  await runCommand('docker', [
    'compose',
    'run',
    '--rm',
    '-entrypoint /bin/bash',
    'ssm-editor',
    `/scripts/run.sh`,
    serviceName,
  ]);
};
