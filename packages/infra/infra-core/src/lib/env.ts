// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as ts from 'typescript';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      SB_BASIC_AUTH: string;
      SB_DOMAIN_API: string;
      SB_DOMAIN_WEB_APP: string;
      SB_DOMAIN_CDN: string;
      SB_DOMAIN_DOCS: string;
      SB_DOMAIN_WWW: string;
      SB_DOMAIN_ADMIN_PANEL: string;
      SB_CLOUDFRONT_CERTIFICATE_ARN: string;
      SB_CERTIFICATE_DOMAIN: string;
      SB_LOAD_BALANCER_CERTIFICATE_ARN: string;
      SB_HOSTED_ZONE_ID: string;
      SB_HOSTED_ZONE_NAME: string;
      SB_DEPLOY_BRANCHES: string;
      PROJECT_NAME: string;
      ENV_STAGE: string;
      VERSION: string;
      PROJECT_ROOT_DIR: string;
      SB_TOOLS_ENABLED: string;
      SB_TOOLS_BASIC_AUTH: string;
      SB_TOOLS_HOSTED_ZONE_NAME: string;
      SB_TOOLS_HOSTED_ZONE_ID: string;
      SB_TOOLS_DOMAIN_VERSION_MATRIX: string;
    }
  }
}
