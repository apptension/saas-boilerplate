import { runCommand } from './runCommand';

type RunSecretsEditorOptions = {
  serviceName: string;
  rootPath: string;
};

export const runSecretsEditor = async ({
  serviceName,
  rootPath,
}: RunSecretsEditorOptions) => {
  await runCommand('pnpm', ['nx', 'run', 'ssm-editor:compose-build-image']);
  await runCommand(
    'docker',
    ['compose', 'run', '--rm', 'ssm-editor', serviceName],
    {
      cwd: rootPath,
    },
  );
};
