import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as cb from 'aws-cdk-lib/aws-codebuild';
import * as cp from 'aws-cdk-lib/aws-codepipeline';
import * as cpa from 'aws-cdk-lib/aws-codepipeline-actions';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as evt from 'aws-cdk-lib/aws-events';
import * as trgt from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lmbd from 'aws-cdk-lib/aws-lambda';
import * as lnjs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { Construct } from 'constructs';

import { Image } from './image';

/**
 * Properties for EcrSync
 */
export interface EcrSyncProps {
  /**
   * Name of the ECR trigger function
   *
   */
  readonly getImageTagsFunctionName: string;

  /**
   * Images from Docker Hub that should be pulled into ECR.
   *
   */
  readonly dockerImages: Image[];

  /**
   * An ECR lifecycle rule which is applied to all repositories.
   *
   * @default No lifecycle rules.
   */
  readonly lifcecyleRule?: ecr.LifecycleRule;

  /**
   * A prefix for all ECR repository names.
   *
   * @default Empty.
   */
  readonly repoPrefix?: string;

  /**
   * Optional. Schedule when images should be synchronized.
   *
   * @default is once a day.
   */
  readonly schedule?: evt.Schedule;

  /**
   * Optional. Bash script injection for the docker image processing phase,
   * in order to log in to Dockerhub or do other initialization.
   *
   * @default Empty.
   */
  readonly initScript?: string;
}

const IMAGES_ARCHIVE_FILENAME = 'images.zip';
const IMAGES_CSV_FILENAME = 'images.csv';

/*
 * Construct to sync Docker images from DockerHub into ECR Repos.
 */
export class EcrSync extends Construct {
  private ecrRepos: ecr.Repository[] = [];

  constructor(scope: Construct, id: string, props: EcrSyncProps) {
    super(scope, id);

    const artifactsBucket = new s3.Bucket(this, 'ArtifactBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
    });

    const buildRole = new iam.Role(this, 'buildRole', {
      assumedBy: new iam.ServicePrincipal('codebuild.amazonaws.com'),
    });

    const lambaFile = `${path.resolve(
      __dirname,
    )}/lambda/get-image-tags-handler`;
    const entry =
      lambaFile + (fs.existsSync(`${lambaFile}.ts`) ? '.ts' : '.js');

    const lambda = new lnjs.NodejsFunction(this, 'lambda', {
      functionName: props.getImageTagsFunctionName,
      entry: entry,
      runtime: lmbd.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.minutes(10),
      logRetention: logs.RetentionDays.ONE_WEEK,
      memorySize: 256,
      environment: {
        AWS_ACCOUNT_ID: cdk.Stack.of(this).account,
        REGION: cdk.Stack.of(this).region,
        IMAGES: JSON.stringify(props.dockerImages),
        REPO_PREFIX: props.repoPrefix ?? '',
        BUCKET_NAME: artifactsBucket.bucketName,
        IMAGES_ARCHIVE_FILENAME,
        IMAGES_CSV_FILENAME,
      },
    });
    artifactsBucket.grantPut(lambda);

    new evt.Rule(this, 'ScheduleGetImageTags', {
      targets: [new trgt.LambdaFunction(lambda)],
      schedule: props.schedule ?? evt.Schedule.rate(cdk.Duration.days(1)),
    });

    props.dockerImages.forEach((element) => {
      const repoName = props.repoPrefix
        ? `${props.repoPrefix}/${element.imageName}`
        : element.imageName;
      const repo = new ecr.Repository(this, element.imageName, {
        repositoryName: repoName,
      });
      repo.grantPullPush(buildRole);

      lambda.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['ecr:ListImages'],
          resources: [repo.repositoryArn],
        }),
      );

      if (props.lifcecyleRule !== undefined) {
        repo.addLifecycleRule(props.lifcecyleRule);
      }

      this.ecrRepos.push(repo);
    });

    // Get triggered by s3
    const triggerStageArtifact = new cp.Artifact();
    const triggerAction = new cpa.S3SourceAction({
      actionName: 'S3Source',
      bucket: artifactsBucket,
      bucketKey: IMAGES_ARCHIVE_FILENAME,
      output: triggerStageArtifact,
    });

    const buildSpecBuild = new cb.PipelineProject(this, 'buildSpecBuild', {
      buildSpec: cb.BuildSpec.fromObject({
        version: '0.2',
        phases: {
          install: {
            'runtime-versions': {
              docker: 18,
            },
            commands: [
              'aws --version',
              'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"',
              'unzip -q awscliv2.zip',
              './aws/install',
              'aws --version',
            ],
          },
          build: {
            commands: [
              ` set -e\n \
                ${props.initScript || ''}\n \
                cat ${IMAGES_CSV_FILENAME}\n \
                while IFS=, read -r dockerImage ecrImage tag\n \
                do\n \
                  echo "$dockerImage:$tag"\n \
                  docker login -u $DOCKER_USERNAME -p $DOCKER_PASSWORD | true
                  docker pull $dockerImage:$tag\n \
                  docker logout | true
                  
                  docker tag $dockerImage:$tag $ecrImage:$tag\n \
                  aws ecr get-login-password | docker login --username AWS --password-stdin \${AWS_ACCOUNT_ID}.dkr.ecr.\${AWS_REGION}.amazonaws.com\n \
                  docker push $ecrImage:$tag\n \
                done < ${IMAGES_CSV_FILENAME}\n`,
            ],
          },
        },
      }),
      role: buildRole,
      environment: {
        privileged: true,
        buildImage: cb.LinuxBuildImage.AMAZON_LINUX_2_3,
        environmentVariables: {
          AWS_ACCOUNT_ID: { value: cdk.Stack.of(this).account },
          DOCKER_USERNAME: {
            type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'GlobalBuildSecrets:DOCKER_USERNAME',
          },
          DOCKER_PASSWORD: {
            type: codebuild.BuildEnvironmentVariableType.SECRETS_MANAGER,
            value: 'GlobalBuildSecrets:DOCKER_PASSWORD',
          },
        },
      },
    });

    const buildAction = new cpa.CodeBuildAction({
      actionName: 'Build',
      input: triggerStageArtifact,
      project: buildSpecBuild,
    });

    new cp.Pipeline(this, 'PullPushPipeline', {
      artifactBucket: artifactsBucket,
      stages: [
        { stageName: 'Trigger', actions: [triggerAction] },
        { stageName: 'PullPush', actions: [buildAction] },
      ],
    });
  }

  /**
   * Grant the given identity permissions to use the images in this repository
   */
  grantPull(grantee: iam.IGrantable) {
    this.ecrRepos.forEach((element) => {
      element.grantPull(grantee);
    });
  }
}
