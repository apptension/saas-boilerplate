import { Command } from '@oclif/core';
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('emails');
export default class EmailsSecrets extends Command {
  static description =
    'Runs an ssm-editor helper tool in docker container to set runtime environmental variables of webapp service. ' +
    'Underneath it uses chamber to both fetch and set those variables in AWS SSM Parameter Store';

  static examples = [`$ <%= config.bin %> <%= command.id %>`];

  async run(): Promise<void> {
    return tracer.startActiveSpan('secrets', async (span) => {
      span.end();
      this.error(
        'Emails package do not have their own separate secrets service. Use `saas webapp secrets` instead.'
      );
    });
  }
}
