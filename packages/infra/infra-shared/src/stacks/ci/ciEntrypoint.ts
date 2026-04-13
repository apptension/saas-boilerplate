import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import { CfnOutput } from 'aws-cdk-lib';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';
import { CiOidcRole } from './ciOidcRole';

export interface CiEntrypointProps extends EnvConstructProps {}

export class CiEntrypoint extends Construct {
  public artifactsBucket: s3.Bucket;

  static getArtifactsName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  constructor(scope: Construct, id: string, props: CiEntrypointProps) {
    super(scope, id);

    this.artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      versioned: true,
    });

    const oidcRole = new CiOidcRole(this, 'OidcRole', {
      envSettings: props.envSettings,
    });
    this.artifactsBucket.grantWrite(oidcRole.role);

    const trail = new cloudtrail.Trail(this, 'CloudTrail');
    trail.addS3EventSelector(
      [
        {
          bucket: this.artifactsBucket,
          objectPrefix: CiEntrypoint.getArtifactsName(props.envSettings),
        },
      ],
      {
        readWriteType: cloudtrail.ReadWriteType.WRITE_ONLY,
      },
    );

    new CfnOutput(this, 'ArtifactsBucketName', {
      exportName: `${props.envSettings.projectEnvName}-artifactsBucketName`,
      value: this.artifactsBucket.bucketName,
    });
  }
}
