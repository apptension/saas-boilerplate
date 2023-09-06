import * as childProcess from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';
import * as dotenv from 'dotenv';
import * as envalid from 'envalid';

export const ENV_STAGE_LOCAL = 'local';

const exec = promisify(childProcess.exec);

type LoadDotenvOptions = {
  rootPath: string;
};
export const loadDotenv = async ({ rootPath }: LoadDotenvOptions) => {
  dotenv.config({ path: resolve(rootPath, '.env') });
};

export async function loadVersionEnv() {
  if (process.env.VERSION) {
    return;
  }

  const { stdout: versionRaw } = await exec(
    'git describe --tags --first-parent --abbrev=11 --long --dirty --always'
  );
  const version = versionRaw.trim();
  process.env.VERSION = version;
  return version;
}

export async function validateStageEnv() {
  return envalid.cleanEnv(process.env, {
    PROJECT_NAME: envalid.str({
      desc: 'The name of your project (best if 3-5 characters to avoid AWS names being to long)',
      example: 'saas',
    }),
    AWS_DEFAULT_REGION: envalid.str({
      desc: 'Default AWS region code',
      example: 'eu-west-1',
    }),
    COMPOSE_FILE: envalid.str({
      desc: 'Specifies the path to a Compose file. Specifying multiple Compose files is supported. Visit https://docs.docker.com/compose/environment-variables/envvars/#compose_file to read more',
      example: 'docker-compose.yml:docker-compose.ci.yml',
      default: 'docker-compose.yml:docker-compose.ci.yml',
    }),
    SB_HOSTED_ZONE_ID: envalid.str({
      desc: 'Id of a AWS Route53 hosted zone of a domain used to host services of this environment',
    }),
    SB_HOSTED_ZONE_NAME: envalid.str({
      desc: 'Name of a AWS Route53 hosted zone of a domain used to host services of this environment',
      example: 'example.com',
    }),
    SB_DOMAIN_ADMIN_PANEL: envalid.str({
      desc: 'A domain used to host an admin panel service',
      example: 'admin.example.com',
    }),
    SB_DOMAIN_API: envalid.str({
      desc: 'A domain used to host an API backend service',
      example: 'api.example.com',
    }),
    SB_DOMAIN_WEB_APP: envalid.str({
      desc: 'A domain used to host the web application',
      example: 'app.example.com',
    }),
    SB_DOMAIN_DOCS: envalid.str({
      desc: 'A domain used to host the documentation',
      example: 'docs.example.com',
    }),
    SB_DOMAIN_CDN: envalid.str({
      desc: 'A domain used to static assets delivery',
      example: 'cdn.example.com',
    }),
    SB_DEPLOY_BRANCHES: envalid.str({
      default: '',
      desc: 'A comma separated list of branches that will trigger automatic deployment of the environment',
      example: 'master,main',
    }),
    SB_BASIC_AUTH: envalid.str({
      default: '',
      desc: 'Username and password separated by colon (":") used to protect website form unauthorized access',
      example: 'admin:password',
    }),
    COMPOSE_PATH_SEPARATOR: envalid.str({
      desc: 'Specifies a different path separator for items listed in COMPOSE_FILE. Visit https://docs.docker.com/compose/environment-variables/envvars/#compose_path_separator to read more',
      default: ':',
    }),
    SB_CLOUDFRONT_CERTIFICATE_ARN: envalid.str({
      desc: 'ARN of already generated certificate that should be attached to CloudFront distribution. This certificate needs to be generated in us-east-1 region.',
      default: '',
    }),
    SB_LOAD_BALANCER_CERTIFICATE_ARN: envalid.str({
      desc: 'ARN of already generated certificate that should be attached to Load Balancer. This certificate needs to be generated in the same region as the application.',
      default: '',
    }),
    SB_CERTIFICATE_DOMAIN: envalid.str({
      desc: 'The domain will be used to generate a certificate, if not provided will be used envStage and hosted zone name',
      default: '',
    }),
    SB_BACKEND_BASE_IMAGE: envalid.str({
      desc: 'Base docker image to use to build Backend inside AWS CodeBuild',
      example: 'python:3.11-slim-bullseye',
      default: 'python:3.11-slim-bullseye',
    }),
    SB_WORKERS_BASE_IMAGE: envalid.str({
      desc: 'Base docker image to use to build Workers inside AWS CodeBuild',
      example: 'python:3.9-slim-bullseye',
      default: 'python:3.9-slim-bullseye',
    }),
    SB_E2E_TESTS_BASE_IMAGE: envalid.str({
      desc: 'Base docker image to use to build E2E Tests inside AWS CodeBuild',
      example: 'cypress-io/cypress/included:12.3.0',
      default: 'cypress-io/cypress/included:12.3.0',
    }),
  });
}
