import { Command, Flags, Interfaces } from '@oclif/core';
import { ExitError } from '@oclif/core/lib/errors';
import { Span, SpanStatusCode, trace, Tracer } from '@opentelemetry/api';

import { SB_TELEMETRY_DISABLED } from './config/env';
import { traceExporter } from './config/telemetry';

const formatAttrs = (obj: { [k: string]: string } = {}, prefix = '') => {
  return Object.fromEntries(
    Object.keys(obj).map((key: string) => {
      return [[prefix, key].join('.'), obj[key]];
    })
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

    if (!SB_TELEMETRY_DISABLED) {
      this.printTelemetryInfo();
      this.tracer = trace.getTracer('command', this.config.version);

      this.span = this.tracer.startSpan(`command.${this.ctor.id}`, {
        attributes: {
          ...formatAttrs(flags, 'flags'),
          ...formatAttrs(args, 'args'),
        },
      });
    }
  }

  protected async catch(err: Error & { exitCode?: number }): Promise<any> {
    if (!SB_TELEMETRY_DISABLED) {
      if (!(err instanceof ExitError) || err.oclif.exit !== 0) {
        this.span?.addEvent('Command error');
        this.span?.recordException(err);
        this.span?.setStatus({ code: SpanStatusCode.ERROR });
      }
    }
    return super.catch(err);
  }

  protected async finally(_: Error | undefined): Promise<any> {
    if (!SB_TELEMETRY_DISABLED) {
      this.span?.addEvent('Command finished');
      this.span?.end();

      // Need to wait en event loop for the internal promise in exporter to be visible
      await new Promise((resolve) => setTimeout(() => resolve(true)));
      // wait for the exporter to send data
      await traceExporter.forceFlush();
    }
    return super.finally(_);
  }

  protected printTelemetryInfo(): void {
    console.log({SB_TELEMETRY_DISABLED})
    if (!SB_TELEMETRY_DISABLED) {
      this.log(`\x1b[2m
------ Notice ------
This CLI collects various anonymous events, warnings, and errors to improve the CLI tool and enhance your user experience.
Read more: [Your GitHub or documentation link here]
If you want to opt out of telemetry, you can set the environment variable SB_TELEMETRY_DISABLED to 1 in your shell.
For example:
   export SB_TELEMETRY_DISABLED=1
    \x1b[0m`);
    }
  }
}
