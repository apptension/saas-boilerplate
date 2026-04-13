import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib';
import { EnvConstructProps, CI_PROVIDER } from '@sb/infra-core';

export interface CiOidcRoleProps extends EnvConstructProps {}

export class CiOidcRole extends Construct {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props: CiOidcRoleProps) {
    super(scope, id);

    const { CIConfig, projectEnvName } = props.envSettings;
    const { provider, repo, bitbucketWorkspaceUUID } = CIConfig;

    let oidcProvider: iam.OpenIdConnectProvider;
    let conditions: { [key: string]: { [key: string]: string } };

    if (provider === CI_PROVIDER.GITHUB) {
      oidcProvider = new iam.OpenIdConnectProvider(
        this,
        'GithubOidcProvider',
        {
          url: 'https://token.actions.githubusercontent.com',
          clientIds: ['sts.amazonaws.com'],
        },
      );

      conditions = {
        StringLike: {
          'token.actions.githubusercontent.com:sub': `repo:${repo}:*`,
        },
        StringEquals: {
          'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com',
        },
      };
    } else {
      const workspaceUUID = bitbucketWorkspaceUUID!;
      const oidcHostname = `api.bitbucket.org/2.0/workspaces/${workspaceUUID}/pipelines-config/identity/oidc`;

      oidcProvider = new iam.OpenIdConnectProvider(
        this,
        'BitbucketOidcProvider',
        {
          url: `https://${oidcHostname}`,
          clientIds: [`ari:cloud:bitbucket::workspace/${workspaceUUID}`],
        },
      );

      conditions = {
        StringLike: {
          [`${oidcHostname}:sub`]: `${repo}:*`,
        },
      };
    }

    this.role = new iam.Role(this, 'CiOidcRole', {
      assumedBy: new iam.WebIdentityPrincipal(
        oidcProvider.openIdConnectProviderArn,
        conditions,
      ),
      description: `CI/CD OIDC role for ${provider} deployments`,
    });

    new CfnOutput(this, 'CiRoleArn', {
      exportName: `${projectEnvName}-ciRoleArn`,
      value: this.role.roleArn,
    });
  }
}
