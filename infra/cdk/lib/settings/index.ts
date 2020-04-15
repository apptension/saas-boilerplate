import './environment';

export interface EnvironmentSettings {
    projectName: string
    envStage: string
}

export function loadEnvSettings(): EnvironmentSettings {
    const settings = {
        projectName: process.env.PROJECT_NAME,
        envStage: process.env.ENV_STAGE,
    }

    if (!settings.envStage) {
        throw new Error('Environmental variable ENV_STAGE is undefined!')
    }

    return settings
}
