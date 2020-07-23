import './types';

export interface EnvironmentSettingsDomains {
    adminPanel: string;
    api: string;
    webApp: string;
    www: string;
    versionMatrixDomain: string;
}

export interface EnvironmentSettingsHostedZone {
    id: string;
    name: string;
}

export interface EnvironmentSettings {
    appBasicAuth: string | null;
    projectRootDir: string;
    projectName: string;
    projectEnvName: string;
    envStage: string;
    version: string;
    hostedZone: EnvironmentSettingsHostedZone;
    toolsBasicAuth: string | null;
    toolsHostedZone: EnvironmentSettingsHostedZone;
    domains: EnvironmentSettingsDomains;
}

const parseValue = (value: string) => {
    if (value === 'undefined') {
        return null;
    }

    if (typeof value === 'undefined') {
        return null;
    }

    return value;
}

export function loadEnvSettings(): EnvironmentSettings {
    const projectName = process.env.PROJECT_NAME;
    const envStage = process.env.ENV_STAGE;

    if (!envStage) {
        throw new Error('Environmental variable ENV_STAGE is undefined!')
    }

    return {
        appBasicAuth: parseValue(process.env.APP_BASIC_AUTH),
        projectRootDir: process.env.PROJECT_ROOT_DIR,
        projectName: projectName,
        projectEnvName: `${projectName}-${envStage}`,
        envStage: process.env.ENV_STAGE,
        version: process.env.VERSION,
        hostedZone: {
            id: process.env.HOSTED_ZONE_ID,
            name: process.env.HOSTED_ZONE_NAME,
        },
        toolsBasicAuth: parseValue(process.env.TOOLS_BASIC_AUTH),
        toolsHostedZone: {
            id: process.env.TOOLS_HOSTED_ZONE_ID,
            name: process.env.TOOLS_HOSTED_ZONE_NAME,
        },
        domains: {
            adminPanel: process.env.ADMIN_PANEL_DOMAIN,
            api: process.env.API_DOMAIN,
            webApp: process.env.WEB_APP_DOMAIN,
            www: process.env.WWW_DOMAIN,
            versionMatrixDomain: process.env.VERSION_MATRIX_DOMAIN,
        },
    };
}
