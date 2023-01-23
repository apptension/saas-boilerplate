// @ts-ignore
import * as ts from 'typescript'

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PROJECT_ROOT_DIR: string;
            PROJECT_NAME: string;
            ENV_STAGE: string;
            VERSION: string;
            SSH_PUBLIC_KEY: string;
        }
    }
}
