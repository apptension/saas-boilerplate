import * as os from 'node:os';

import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

import {
  SB_TELEMETRY_DISABLED,
  SB_TELEMETRY_KEY,
  SB_TELEMETRY_URL,
} from './env';

export const isEnabled = !SB_TELEMETRY_DISABLED;

export const traceExporter = new OTLPTraceExporter({
  url: SB_TELEMETRY_URL,
  headers: {
    'x-honeycomb-team': SB_TELEMETRY_KEY,
  },
});

export const provider = new NodeTracerProvider({
  resource: Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'saas-cli',
      [SemanticResourceAttributes.OS_TYPE]: os.type(),
      [SemanticResourceAttributes.OS_DESCRIPTION]: os.release(),
      [SemanticResourceAttributes.OS_VERSION]: os.version(),
    }),
  ),
});

provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
