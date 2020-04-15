#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {loadEnvSettings} from '../lib/settings';
import {GlobalStack} from '../lib/stacks/global';

const envSettings = loadEnvSettings();

const getStackName = (baseName: string) => `${envSettings.projectName}${baseName}`

const app = new cdk.App();
new GlobalStack(app, getStackName('GlobalStack'));
app.synth();
