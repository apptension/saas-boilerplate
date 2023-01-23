import './types';

export interface EnvConfigHostedZone {
    id: string;
    name: string;
}

interface EnvConfigFileDomains {
    adminPanel: string;
    api: string;
    webApp: string;
    docs: string;
    www: string;
    cdn: string;
}

interface ToolsDomains {
    versionMatrix: string | undefined;
}

export interface ToolsConfig {
    enabled: boolean,
    basicAuth: string | undefined,
    hostedZone: EnvConfigHostedZone,
    domains: ToolsDomains
}

interface CertificatesConfig {
    cloudfrontCertificateArn: string;
    loadBalancerCertificateArn: string;
    domain: string;
}

interface EnvironmentVariables {
    [name: string]: string;
}

interface WebAppConfig {
    envVariables: EnvironmentVariables;
}

export interface EnvironmentSettings {
    appBasicAuth: string | null | undefined;
    deployBranches: Array<string>;
    domains: EnvConfigFileDomains;
    envStage: string;
    hostedZone: EnvConfigHostedZone;
    projectRootDir: string;
    projectName: string;
    projectEnvName: string;
    tools: ToolsConfig,
    version: string;
    webAppEnvVariables: EnvironmentVariables;
    certificates: CertificatesConfig;
}

interface ConfigFileContent {
    toolsConfig: ToolsConfig;
    webAppConfig: WebAppConfig;
}

export interface EnvConfigFileContent {
    deployBranches: Array<string>,
    hostedZone: EnvConfigHostedZone,
    basicAuth: string | null | undefined,
    domains: EnvConfigFileDomains,
    webAppConfig: WebAppConfig,
    certificates: CertificatesConfig;
}

async function readConfig(): Promise<ConfigFileContent> {
    return {
        webAppConfig: {
            envVariables: {}
        },
        toolsConfig: {
            enabled: process.env.SB_TOOLS_ENABLED === 'true',
            basicAuth: process.env.SB_TOOLS_BASIC_AUTH,
            hostedZone: {
                id: process.env.SB_TOOLS_HOSTED_ZONE_NAME || '',
                name: process.env.SB_TOOLS_HOSTED_ZONE_ID || '',
            },
            domains: {
                versionMatrix: process.env.SB_TOOLS_DOMAIN_VERSION_MATRIX,
            }
        }
    };
}


async function readEnvConfig(): Promise<EnvConfigFileContent> {
    return {
        webAppConfig: {
            envVariables: {}
        },
        basicAuth: process.env.SB_BASIC_AUTH,
        domains: {
            api: process.env.DOMAIN_API ?? '',
            webApp: process.env.DOMAIN_WEB_APP ?? '',
            cdn: process.env.DOMAIN_CDN ?? '',
            docs: process.env.DOMAIN_DOCS ?? '',
            www: process.env.DOMAIN_WWW ?? '',
            adminPanel: process.env.DOMAIN_ADMIN_PANEL ?? ''
        },
        certificates: {
            cloudfrontCertificateArn: process.env.SB_CLOUDFRONT_CERTIFICATE_ARN ?? '',
            domain: process.env.SB_CERTIFICATE_DOMAIN ?? '',
            loadBalancerCertificateArn: process.env.SB_LOAD_BALANCER_CERTIFICATE_ARN ?? ''
        },
        hostedZone: {
            id: process.env.SB_HOSTED_ZONE_ID ?? '',
            name: process.env.SB_HOSTED_ZONE_NAME ?? ''
        },
        deployBranches: process.env.SB_DEPLOY_BRANCHES?.split(',') ?? [],
    };
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
    const envConfig = await readEnvConfig();

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
        webAppEnvVariables: {
            ...(config?.webAppConfig?.envVariables || {}),
            ...(envConfig?.webAppConfig?.envVariables || {}),
        },
        certificates: envConfig.certificates,
    };
}
