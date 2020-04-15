// @ts-ignore
import * as ts from 'typescript'

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PROJECT_NAME: string;
            ENV_STAGE: string;
        }
    }
}
