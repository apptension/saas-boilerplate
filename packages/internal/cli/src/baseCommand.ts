import { Command, Flags, Interfaces } from '@oclif/core';
import { ExitError } from '@oclif/core/lib/errors';
import { Span, SpanStatusCode, trace, Tracer } from '@opentelemetry/api';

import * as telemetry from './config/telemetry';

const formatAttrs = (obj: { [k: string]: string } = {}, prefix = '') => {
  return Object.fromEntries(
    Object.keys(obj).map((key: string) => {
      return [[prefix, key].join('.'), obj[key]];
    }),
  );
};

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)['baseFlags'] & T['flags']
>;
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>;

export abstract class BaseCommand<T extends typeof Command> extends Command {
  protected tracer: Tracer | null = null;
  protected span: Span | null = null;

  static baseFlags = {};

  protected flags!: Flags<T>;
  protected args!: Args<T>;

  public async init(): Promise<void> {
    await super.init();
    const { args, flags } = await this.parse({
      flags: this.ctor.flags,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    });
    this.flags = flags as Flags<T>;
    this.args = args as Args<T>;

    if (telemetry.isEnabled) {
      this.printTelemetryInfo();
      this.tracer = trace.getTracer('command', this.config.version);
    }
  }

  async _run() {
    let err;
    let result;
    try {
      // remove redirected env var to allow subsessions to run autoupdated client
      // @ts-ignore
      this.removeEnvVar('REDIRECTED');
      await this.init();

      if (telemetry.isEnabled && this.tracer) {
        result = await this.tracer.startActiveSpan(
          `command.${this.ctor.id}`,
          {
            attributes: {
              ...formatAttrs(this.flags, 'flags'),
            },
          },
          async (span) => {
            this.span = span;
            return await this.run();
          },
        );
      } else {
        result = await this.run();
      }
    } catch (error: any) {
      err = error;
      await this.catch(error);
    } finally {
      await this.finally(err);
    }
    if (result && this.jsonEnabled()) this.logJson(this.toSuccessJson(result));
    return result;
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    if (telemetry.isEnabled) {
      if (!(err instanceof ExitError) || err.oclif.exit !== 0) {
        this.span?.addEvent('Command error');
        this.span?.recordException(err);
        this.span?.setStatus({ code: SpanStatusCode.ERROR });
      }
    }
    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    if (telemetry.isEnabled) {
      this.span?.addEvent('Command finished');
      this.span?.end();

      // Need to wait en event loop for the internal promise in exporter to be visible
      await new Promise((resolve) => setTimeout(() => resolve(true)));
      // wait for the exporter to send data
      await telemetry.traceExporter.forceFlush();
    }
    return super.finally(_);
  }

  protected printTelemetryInfo(): void {
    this.log(`\x1b[2m
------ Notice ------
This CLI collects various anonymous events, warnings, and errors to improve the CLI tool and enhance your user experience.
Read more: https://docs.demo.saas.apptoku.com/working-with-sb/dev-tools/telemetry
If you want to opt out of telemetry, you can set the environment variable SB_TELEMETRY_DISABLED to 1 in your shell.
For example:
   export SB_TELEMETRY_DISABLED=1
    \x1b[0m`);
  }
}
