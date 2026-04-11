import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnOutput } from 'aws-cdk-lib';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';
import { GlobalResources } from '../global/resources';

export interface CiEntrypointProps extends EnvConstructProps {}

export class CiEntrypoint extends Construct {
  public artifactsBucket: s3.Bucket;
  static getArtifactsName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  private retrieveExternalCIUser() {
    return iam.User.fromUserName(
      this,
      'ExternalCiUser',
      GlobalResources.getExternalCIUserName(),
    );
  }

  constructor(scope: Construct, id: string, props: CiEntrypointProps) {
    super(scope, id);

    this.artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      versioned: true,
    });

    const externalCiUser = this.retrieveExternalCIUser();
    new iam.Policy(this, 'ExternalCiUserArtifactsPolicy', {
      policyName: `${props.envSettings.projectEnvName}-ci-artifacts-write`,
      users: [externalCiUser],
      statements: [
        new iam.PolicyStatement({
          actions: [
            's3:DeleteObject*',
            's3:PutObject',
            's3:PutObjectLegalHold',
            's3:PutObjectRetention',
            's3:PutObjectTagging',
            's3:PutObjectVersionTagging',
            's3:Abort*',
          ],
          resources: [
            this.artifactsBucket.bucketArn,
            `${this.artifactsBucket.bucketArn}/*`,
          ],
        }),
      ],
    });

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
