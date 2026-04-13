import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { CI_MODE, CI_PROVIDER, EnvironmentSettings } from '@sb/infra-core';
import { CiOidcRole } from './ciOidcRole';

const makeEnvSettings = (
  provider: CI_PROVIDER,
  repo: string,
  bitbucketWorkspaceUUID?: string,
): EnvironmentSettings => ({
  envStage: 'qa',
  projectName: 'test-project',
  projectEnvName: 'test-project-qa',
  version: '1.0.0',
  appBasicAuth: null,
  domains: {
    api: '',
    webApp: '',
    cdn: '',
    docs: '',
    www: '',
    adminPanel: '',
    flower: '',
    mcp: '',
  },
  hostedZone: { id: '', name: '' },
  tools: {
    enabled: false,
    basicAuth: undefined,
    hostedZone: { id: '', name: '' },
    domains: { versionMatrix: undefined },
  },
  webAppEnvVariables: {},
  certificates: {
    cloudfrontCertificateArn: '',
    loadBalancerCertificateArn: '',
    domain: '',
  },
  CIConfig: {
    mode: CI_MODE.PARALLEL,
    provider,
    repo,
    bitbucketWorkspaceUUID,
  },
  aiConfig: { enabled: false, mcpServerUrl: undefined },
});

describe('CiOidcRole - GitHub', () => {
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });
    new CiOidcRole(stack, 'CiOidcRole', {
      envSettings: makeEnvSettings(CI_PROVIDER.GITHUB, 'myorg/my-repo'),
    });
    template = Template.fromStack(stack);
  });

  it('creates a GitHub OIDC provider', () => {
    template.hasResourceProperties('Custom::AWSCDKOpenIdConnectProvider', {
      Url: 'https://token.actions.githubusercontent.com',
      ClientIDList: ['sts.amazonaws.com'],
    });
  });

  it('creates an IAM role with GitHub federated trust', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRoleWithWebIdentity',
            Effect: 'Allow',
            Condition: {
              StringLike: {
                'token.actions.githubusercontent.com:sub': 'repo:myorg/my-repo:*',
              },
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
              },
            },
          },
        ],
      },
    });
  });

  it('outputs the role ARN', () => {
    const outputs = template.findOutputs('*', {
      Export: { Name: 'test-project-qa-ciRoleArn' },
    });
    expect(Object.keys(outputs).length).toBeGreaterThan(0);
  });
});

describe('CiOidcRole - Bitbucket', () => {
  const workspaceUUID = 'aabbccdd-1122-3344-5566-aabbccddeeff';
  const repoUUID = '{11223344-aabb-ccdd-eeff-112233445566}';
  let template: Template;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'TestStack', {
      env: { account: '123456789012', region: 'us-east-1' },
    });
    new CiOidcRole(stack, 'CiOidcRole', {
      envSettings: makeEnvSettings(
        CI_PROVIDER.BITBUCKET,
        repoUUID,
        workspaceUUID,
      ),
    });
    template = Template.fromStack(stack);
  });

  it('creates a Bitbucket OIDC provider with workspace-scoped URL', () => {
    template.hasResourceProperties('Custom::AWSCDKOpenIdConnectProvider', {
      Url: `https://api.bitbucket.org/2.0/workspaces/${workspaceUUID}/pipelines-config/identity/oidc`,
      ClientIDList: [`ari:cloud:bitbucket::workspace/${workspaceUUID}`],
    });
  });

  it('creates an IAM role with Bitbucket federated trust scoped to the repo', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Action: 'sts:AssumeRoleWithWebIdentity',
            Effect: 'Allow',
            Condition: {
              StringLike: {
                [`api.bitbucket.org/2.0/workspaces/${workspaceUUID}/pipelines-config/identity/oidc:sub`]:
                  `${repoUUID}:*`,
              },
            },
          },
        ],
      },
    });
  });

  it('outputs the role ARN', () => {
    const outputs = template.findOutputs('*', {
      Export: { Name: `test-project-qa-ciRoleArn` },
    });
    expect(Object.keys(outputs).length).toBeGreaterThan(0);
  });
});
