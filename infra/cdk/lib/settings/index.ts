import {camelize} from 'humps';

import './environment';

export interface EnvironmentSettings {
    projectName: string
}

export function loadEnvSettings(): EnvironmentSettings {
    return {
        projectName: process.env.PROJECT_NAME,
    }
}
