#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';

import {loadEnvSettings} from '../lib/settings';
import {GlobalStack} from '../lib/stacks/global';
import {EnvMainStack} from '../lib/stacks/envMain';

const envSettings = loadEnvSettings();

const getStackName = (baseName: string, prefix: string) => `${prefix}-${baseName}`;

const app = new cdk.App();

new GlobalStack(app, getStackName('GlobalStack', envSettings.projectName), envSettings);
new EnvMainStack(app, getStackName("EnvMainStack", envSettings.projectEnvName), envSettings)

app.synth();
