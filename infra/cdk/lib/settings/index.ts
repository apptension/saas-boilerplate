import {promises as fs} from 'fs';
import * as path from 'path';

import './types';

export interface EnvConfigHostedZone {
    id: string;
    name: string;
}

interface EnvConfigFileDomains {
    adminPanel: string;
    api: string;
    webApp: string;
    www: string;
}

interface ToolsDomains {
    versionMatrix: string;
}

interface ToolsConfig {
    enabled: true,
    basicAuth: string,
    hostedZone: EnvConfigHostedZone,
    domains: ToolsDomains
}

interface SshBastionConfig {
    sshPublicKey: string | null | undefined;
}

export interface EnvironmentSettings {
    appBasicAuth: string | null;
    deployBranches: Array<string>;
    domains: EnvConfigFileDomains;
    envStage: string;
    hostedZone: EnvConfigHostedZone;
    projectRootDir: string;
    projectName: string;
    projectEnvName: string;
    tools: ToolsConfig,
    version: string;
    sshBastion: SshBastionConfig;
}

interface ConfigFileContent {
    toolsConfig: ToolsConfig
}

export interface EnvConfigFileContent {
    deployBranches: Array<string>,
    hostedZone: EnvConfigHostedZone,
    basicAuth: string,
    domains: EnvConfigFileDomains
}

async function readConfig(): Promise<ConfigFileContent> {
    const configFileName = `.awsboilerplate.json`;
    const configFilePath = path.join(process.env.PROJECT_ROOT_DIR, configFileName);

    try {
        await fs.stat(configFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Config file ${configFileName} does not exist. `)
        }
        throw err;
    }

    const strContent = await fs.readFile(configFilePath, "utf8");
    return JSON.parse(strContent);
}


async function readEnvConfig(envStage: string): Promise<EnvConfigFileContent> {
    const envConfigFileName = `.awsboilerplate.${envStage}.json`;
    const envConfigFilePath = path.join(process.env.PROJECT_ROOT_DIR, envConfigFileName);

    try {
        await fs.stat(envConfigFilePath);
    } catch (err) {
        if (err.code === 'ENOENT') {
            throw new Error(`Config file ${envConfigFileName} for environment ${envStage} does not exist. `)
        }
        throw err;
    }

    const strContent = await fs.readFile(envConfigFilePath, "utf8");
    return JSON.parse(strContent);
}

export async function loadEnvSettings(): Promise<EnvironmentSettings> {
    const projectName = process.env.PROJECT_NAME;
    const envStage = process.env.ENV_STAGE;

    if (!envStage) {
        throw new Error('Environmental variable ENV_STAGE is undefined!')
    }

    if (['local', 'test'].includes(envStage)) {
        throw new Error(`ENV_STAGE environment variable cannot be set to '${envStage}'`)
    }

    const config = await readConfig();
    const envConfig = await readEnvConfig(envStage);

    return {
        envStage,
        projectName,
        projectEnvName: `${projectName}-${envStage}`,
        version: process.env.VERSION,
        projectRootDir: process.env.PROJECT_ROOT_DIR,
        tools: config.toolsConfig,
        appBasicAuth: envConfig.basicAuth,
        hostedZone: envConfig.hostedZone,
        domains: envConfig.domains,
        deployBranches: envConfig.deployBranches,
        sshBastion: {
            sshPublicKey: process.env.BASTION_SSH_PUBLIC_KEY,
        },
    };
}
