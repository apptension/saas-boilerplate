declare const process: {
  env: {
    SB_BASIC_AUTH: string;
    SB_DOMAIN_API: string;
    SB_DOMAIN_WEB_APP: string;
    SB_DOMAIN_CDN: string;
    SB_DOMAIN_DOCS: string;
    SB_DOMAIN_WWW: string;
    SB_DOMAIN_ADMIN_PANEL: string;
    SB_DOMAIN_FLOWER: string;
    SB_CLOUDFRONT_CERTIFICATE_ARN: string;
    SB_CERTIFICATE_DOMAIN: string;
    SB_LOAD_BALANCER_CERTIFICATE_ARN: string;
    SB_HOSTED_ZONE_ID: string;
    SB_HOSTED_ZONE_NAME: string;
    PROJECT_NAME: string;
    ENV_STAGE: string;
    VERSION: string;
    SB_TOOLS_ENABLED: string;
    SB_TOOLS_BASIC_AUTH: string;
    SB_TOOLS_HOSTED_ZONE_NAME: string;
    SB_TOOLS_HOSTED_ZONE_ID: string;
    SB_TOOLS_DOMAIN_VERSION_MATRIX: string;
    SB_CI_MODE: string;
  };
};

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
  flower: string;
}

interface ToolsDomains {
  versionMatrix: string | undefined;
}

export interface ToolsConfig {
  enabled: boolean;
  basicAuth: string | undefined;
  hostedZone: EnvConfigHostedZone;
  domains: ToolsDomains;
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

export enum CI_MODE {
  PARALLEL = 'parallel',
  SIMPLE = 'simple',
}

interface CIConfig {
  mode: CI_MODE;
}

export interface EnvironmentSettings {
  appBasicAuth: string | null | undefined;
  domains: EnvConfigFileDomains;
  envStage: string;
  hostedZone: EnvConfigHostedZone;
  projectName: string;
  projectEnvName: string;
  tools: ToolsConfig;
  version: string;
  webAppEnvVariables: EnvironmentVariables;
  certificates: CertificatesConfig;
  CIConfig: CIConfig;
}

interface ConfigFileContent {
  toolsConfig: ToolsConfig;
  webAppConfig: WebAppConfig;
  CIConfig: CIConfig;
}

export interface EnvConfigFileContent {
  hostedZone: EnvConfigHostedZone;
  basicAuth: string | null | undefined;
  domains: EnvConfigFileDomains;
  webAppConfig: WebAppConfig;
  certificates: CertificatesConfig;
}

async function readConfig(): Promise<ConfigFileContent> {
  return {
    webAppConfig: {
      envVariables: {},
    },
    toolsConfig: {
      enabled: process.env.SB_TOOLS_ENABLED === 'true',
      basicAuth: process.env.SB_TOOLS_BASIC_AUTH,
      hostedZone: {
        id: process.env.SB_TOOLS_HOSTED_ZONE_ID || '',
        name: process.env.SB_TOOLS_HOSTED_ZONE_NAME || '',
      },
      domains: {
        versionMatrix: process.env.SB_TOOLS_DOMAIN_VERSION_MATRIX,
      },
    },
    CIConfig: {
      mode:
        process.env.SB_CI_MODE === CI_MODE.SIMPLE
          ? CI_MODE.SIMPLE
          : CI_MODE.PARALLEL,
    },
  };
}

async function readEnvConfig(envStage: string): Promise<EnvConfigFileContent> {
  if (!process.env.SB_DOMAIN_API) {
    throw new Error('SB_DOMAIN_API env variable has to be defined');
  }

  const hostedZoneName = process.env.SB_HOSTED_ZONE_NAME ?? '';
  const certDomain = process.env.SB_CERTIFICATE_DOMAIN;
  const defaultDomain = certDomain ?? `${envStage}.${hostedZoneName}`;

  return {
    webAppConfig: {
      envVariables: {},
    },
    basicAuth: process.env.SB_BASIC_AUTH,
    domains: {
      api: process.env.SB_DOMAIN_API ?? `api.${defaultDomain}`,
      webApp: process.env.SB_DOMAIN_WEB_APP ?? `app.${defaultDomain}`,
      cdn: process.env.SB_DOMAIN_CDN ?? `cdn.${defaultDomain}`,
      docs: process.env.SB_DOMAIN_DOCS ?? `docs.${defaultDomain}`,
      www: process.env.SB_DOMAIN_WWW ?? `www.${defaultDomain}`,
      adminPanel: process.env.SB_DOMAIN_ADMIN_PANEL ?? `admin.${defaultDomain}`,
      flower: process.env.SB_DOMAIN_FLOWER ?? `flower.${defaultDomain}`,
    },
    certificates: {
      cloudfrontCertificateArn: process.env.SB_CLOUDFRONT_CERTIFICATE_ARN ?? '',
      domain: certDomain ?? '',
      loadBalancerCertificateArn:
        process.env.SB_LOAD_BALANCER_CERTIFICATE_ARN ?? '',
    },
    hostedZone: {
      id: process.env.SB_HOSTED_ZONE_ID ?? '',
      name: hostedZoneName,
    },
  };
}

export async function loadEnvSettings(): Promise<EnvironmentSettings> {
  const projectName = process.env.PROJECT_NAME;
  const envStage = process.env.ENV_STAGE;
  const version = process.env.VERSION;

  if (!envStage) {
    throw new Error('Environmental variable ENV_STAGE is undefined!');
  }

  if (!version) {
    throw new Error('Environmental variable VERSION is undefined!');
  }

  const config = await readConfig();
  const envConfig = await readEnvConfig(envStage);

  return {
    envStage,
    projectName,
    version,
    projectEnvName: `${projectName}-${envStage}`,
    tools: config.toolsConfig,
    appBasicAuth: envConfig.basicAuth,
    hostedZone: envConfig.hostedZone,
    domains: envConfig.domains,
    webAppEnvVariables: {
      ...(config?.webAppConfig?.envVariables || {}),
      ...(envConfig?.webAppConfig?.envVariables || {}),
    },
    certificates: envConfig.certificates,
    CIConfig: config.CIConfig,
  };
}
