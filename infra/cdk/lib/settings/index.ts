import './types';

export interface EnvironmentSettingsDomains {
    adminPanel: string;
}

export interface EnvironmentSettingsHostedZone {
    id: string;
    name: string;
}

export interface EnvironmentSettings {
    projectName: string;
    projectEnvName: string;
    envStage: string;
    version: string;
    certificateArn: string;
    hostedZone: EnvironmentSettingsHostedZone;
    domains: EnvironmentSettingsDomains;
}

export function loadEnvSettings(): EnvironmentSettings {
    const projectName = process.env.PROJECT_NAME;
    const envStage = process.env.ENV_STAGE;

    if (!envStage) {
        throw new Error('Environmental variable ENV_STAGE is undefined!')
    }

    return {
        projectName: projectName,
        projectEnvName: `${projectName}-${envStage}`,
        envStage: process.env.ENV_STAGE,
        version: process.env.VERSION,
        certificateArn: process.env.CERTIFICATE_ARN,
        hostedZone: {
            id: process.env.HOSTED_ZONE_ID,
            name: process.env.HOSTED_ZONE_NAME,
        },
        domains: {
            adminPanel: process.env.ADMIN_PANEL_DOMAIN,
        },
    };
}
