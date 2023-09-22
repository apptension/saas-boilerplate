import { Hook } from '@oclif/core';
import { provider } from '../../config/telemetry';

const hook: Hook<'init'> = async function () {
  provider.register();
};

export default hook;
