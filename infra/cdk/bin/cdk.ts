#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {loadEnvSettings} from '../lib/settings';
import {GlobalStack} from '../lib/stacks/global';

const envSettings = loadEnvSettings();

const getStackName = (baseName: string, envName?: string) => {
    let envPart = '';
    if (envName) {
        envPart = `${envName}-`
    }
    return `${envSettings.projectName}-${envPart}${baseName}`
}

const app = new cdk.App();
new GlobalStack(app, getStackName('GlobalStack'));
app.synth();
