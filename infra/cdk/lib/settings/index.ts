import './types';

export interface EnvironmentSettings {
    projectName: string
    projectEnvName: string
    envStage: string
    version: string
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
    };
}
