import { Hook } from '@oclif/core';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

const traceExporter = new OTLPTraceExporter({
  url: 'https://api.honeycomb.io/v1/traces',
  headers: {
    'x-honeycomb-team': 'Bov6DZ0zbuHIecMk0dJGVG',
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
