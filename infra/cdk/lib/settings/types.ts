// @ts-ignore
import * as ts from 'typescript'

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PROJECT_ROOT_DIR: string;
            PROJECT_NAME: string;
            ENV_STAGE: string;
            VERSION: string;
            HOSTED_ZONE_ID: string;
            HOSTED_ZONE_NAME: string;
            ADMIN_PANEL_DOMAIN: string;
            API_DOMAIN: string;
            WEB_APP_DOMAIN: string;
            WWW_DOMAIN: string;
            VERSION_MATRIX_DOMAIN: string;
            CERTIFICATE_ARN: string;
            CLOUD_FRONT_CERTIFICATE_ARN: string;
            TOOLS_CLOUD_FRONT_CERTIFICATE_ARN: string;
            TOOLS_HOSTED_ZONE_ID: string;
            TOOLS_HOSTED_ZONE_NAME: string;
        }
    }
}
