import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import { BuildEnvironmentVariableType } from 'aws-cdk-lib/aws-codebuild';
import * as cloudtrail from 'aws-cdk-lib/aws-cloudtrail';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { EnvConstructProps, EnvironmentSettings } from '@sb/infra-core';

export interface CiEntrypointProps extends EnvConstructProps {
  codeRepository: codecommit.IRepository;
}

export class CiEntrypoint extends Construct {
  public artifactsBucket: s3.Bucket;
  private readonly codeBuildProject: codebuild.Project;

  static getArtifactsIdentifier(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  static getArtifactsName(envSettings: EnvironmentSettings) {
    return `${envSettings.projectEnvName}-entrypoint`;
  }

  constructor(scope: Construct, id: string, props: CiEntrypointProps) {
    super(scope, id);

    this.artifactsBucket = new s3.Bucket(this, 'ArtifactsBucket', {
      versioned: true,
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

    this.codeBuildProject = this.createBuildProject(
      this.artifactsBucket,
      props,
    );
  }

  private createBuildProject(
    artifactsBucket: s3.Bucket,
    props: CiEntrypointProps,
  ) {
    const SSHPrivateKey = secretsmanager.Secret.fromSecretNameV2(
      this,
      'SSHPrivateKeySecret',
      'SB_CI_GIT_SSH_PRIVATE_KEY',
    );

    return new codebuild.Project(this, 'Project', {
      projectName: props.envSettings.projectEnvName,
      description: `Run this project to deploy ${props.envSettings.envStage} environment`,
      buildSpec: this.createBuildSpec(),
      // cache: codebuild.Cache.local(codebuild.LocalCacheMode.SOURCE),
      artifacts: codebuild.Artifacts.s3({
        identifier: CiEntrypoint.getArtifactsIdentifier(props.envSettings),
        bucket: artifactsBucket,
        name: CiEntrypoint.getArtifactsName(props.envSettings),
        includeBuildId: false,
        path: '',
      }),
      environment: {
        buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
      },
      environmentVariables: {
        CI: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: 'true',
        },
        PROJECT_NAME: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.projectName,
        },
        ENV_STAGE: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: props.envSettings.envStage,
        },
        GIT_SSH_PRIVATE_KEY: {
          type: BuildEnvironmentVariableType.SECRETS_MANAGER,
          value: SSHPrivateKey.secretArn,
        },
        GIT_CLONE_URL: {
          type: BuildEnvironmentVariableType.PARAMETER_STORE,
          value: '/ci/GIT_CLONE_URL',
        },
        GIT_CLONE_REFERENCE: {
          type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
          value: 'master',
        },
      },
    });
  }

  private createBuildSpec() {
    return codebuild.BuildSpec.fromObject({
      version: '0.2',
      env: {
        'exported-variables': ['GIT_COMMIT_ID', 'GIT_COMMIT_MSG'],
      },
      phases: {
        build: {
          commands: [
            'echo "=======================Start-Deployment-Entrypoint============================="',
            'echo "Saving the SSH Private Key"',
            'echo "$GIT_SSH_PRIVATE_KEY" >> ~/.ssh/id_rsa',
            'echo "Setting SSH config profile"',
            'cat > ~/.ssh/config <<EOF\nHost *\n  AddKeysToAgent yes\n  StrictHostKeyChecking no\n  IdentityFile ~/.ssh/id_rsa\nEOF',
            'chmod 600 ~/.ssh/id_rsa',
            'echo "Cloning the repository $GitUrl on branch $Branch"',
            'git clone --single-branch --depth=50 --tags --branch $GIT_CLONE_REFERENCE $GIT_CLONE_URL .',
            'ls -alh',
            'export GIT_COMMIT_ID=$(git rev-parse --short HEAD)',
            'echo $GIT_COMMIT_ID',
            'COMMIT_MSG=$(git log --pretty="format:%Creset%s" --no-merges -1)',
            'export GIT_COMMIT_MSG="${COMMIT_MSG}"',
            'echo $GIT_COMMIT_MSG',
            'app_version=$(git describe --tags --first-parent --abbrev=11 --long --dirty --always)',
            'echo "VERSION=${app_version}" >> .env',
            'echo "=======================End-Deployment-Entrypoint============================="',
          ],
        },
      },
      artifacts: {
        files: ['**/*'],
      },
    });
  }
}
