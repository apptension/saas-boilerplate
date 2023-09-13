import { Hook } from '@oclif/core';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import sbTelemetry from '@apptension/saas-boilerplate-telemetry';

const traceExporter = new OTLPTraceExporter({
  url: sbTelemetry[0],
  headers: {
    'x-honeycomb-team': sbTelemetry[1],
  },
});

const provider = new NodeTracerProvider({
  resource: Resource.default().merge(
    new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'saas-cli',
    })
  ),
});

provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));

const hook: Hook<'init'> = async function (options) {
  provider.register();
};

export default hook;
