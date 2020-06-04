#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';

import {loadEnvSettings} from '../lib/settings';
import {GlobalStack} from '../lib/stacks/global';
import {EnvMainStack} from '../lib/stacks/env/main';
import {EnvComponentsStack} from '../lib/stacks/env/components';
import {AdminPanelStack} from "../lib/stacks/services/adminPanel";
import {ApiStack} from "../lib/stacks/services/api";
import {MigrationsStack} from "../lib/stacks/services/migrations";
import {WebAppStack} from "../lib/stacks/services/webApp";
import {EnvCiStack} from "../lib/stacks/env/ci";

const envSettings = loadEnvSettings();

const getStackName = (baseName: string, prefix: string) => `${prefix}-${baseName}`;

const app = new cdk.App();

// Global stacks
new GlobalStack(app, getStackName('GlobalStack', envSettings.projectName), {envSettings});

// Environment (dev / qa / stage / prod) stacks
new EnvMainStack(app, getStackName("MainStack", envSettings.projectEnvName), {envSettings});
new EnvComponentsStack(app, getStackName("ComponentsStack", envSettings.projectEnvName), {envSettings});
new EnvCiStack(app, getStackName("CiStack", envSettings.projectEnvName), {envSettings});
new AdminPanelStack(app, getStackName('AdminPanelStack', envSettings.projectEnvName), {envSettings});
new ApiStack(app, getStackName('ApiStack', envSettings.projectEnvName), {envSettings});
new MigrationsStack(app, getStackName('MigrationsStack', envSettings.projectEnvName), {envSettings});
new WebAppStack(app, getStackName('WebAppStack', envSettings.projectEnvName), {envSettings});

app.synth();
