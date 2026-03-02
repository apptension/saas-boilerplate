import { Command, Flags, Interfaces } from '@oclif/core';
import { ExitError } from '@oclif/core/lib/errors';
import { Span, SpanStatusCode, trace, Tracer } from '@opentelemetry/api';

import * as telemetry from './config/telemetry';
import { getConfigStorage } from './config/storage';

const TELEMETRY_NOTICE_KEY = 'telemetryNoticeShown';
const TELEMETRY_NOTICE_INTERVAL_DAYS = 7; // Show notice once per week

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
      await this.maybeShowTelemetryNotice();
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

  /**
   * Show telemetry notice only periodically (once per week)
   */
  private async maybeShowTelemetryNotice(): Promise<void> {
    try {
      const storage = await getConfigStorage();
      const lastShown = await storage.getItem(TELEMETRY_NOTICE_KEY);
      const now = Date.now();

      // Check if we should show the notice
      const shouldShow =
        !lastShown ||
        now - lastShown > TELEMETRY_NOTICE_INTERVAL_DAYS * 24 * 60 * 60 * 1000;

      if (shouldShow) {
        this.printTelemetryInfo();
        await storage.setItem(TELEMETRY_NOTICE_KEY, now);
      }
    } catch {
      // If storage fails, show a minimal one-line notice
      this.printMinimalTelemetryInfo();
    }
  }

  /**
   * Full telemetry notice (shown periodically)
   */
  protected printTelemetryInfo(): void {
    // Compact, less intrusive notice
    this.log(
      '\x1b[2m' +
        'Telemetry enabled. Opt out: export SB_TELEMETRY_DISABLED=1 | ' +
        'More: https://docs.demo.saas.apptoku.com/working-with-sb/dev-tools/telemetry' +
        '\x1b[0m\n',
    );
  }

  /**
   * Minimal one-line telemetry notice (fallback)
   */
  protected printMinimalTelemetryInfo(): void {
    this.log('\x1b[2mTelemetry enabled. Set SB_TELEMETRY_DISABLED=1 to opt out.\x1b[0m\n');
  }
}
