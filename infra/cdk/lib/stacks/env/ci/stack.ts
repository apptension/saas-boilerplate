import {App, aws_codecommit as codeCommit, Stack, StackProps} from "aws-cdk-lib";
import {Repository} from "aws-cdk-lib/aws-ecr";

import {EnvConstructProps} from "../../../types";
import {GlobalECR} from "../../global/resources/globalECR";
import {GlobalCodeCommit} from "../../global/resources/globalCodeCommit";
import {BaseImagesConfig} from "../../global/resources/baseImagesConfig";
import {CiPipeline} from "./ciPipeline";
import {CiEntrypoint} from "./ciEntrypoint";

export interface EnvCiStackProps extends StackProps, EnvConstructProps {}

export class EnvCiStack extends Stack {
  constructor(scope: App, id: string, props: EnvCiStackProps) {
    super(scope, id, props);

    const backendRepository = this.retrieveBackendECRRepository(props);
    const webappBaseRepository = this.retrieveWebappBaseECRRepository(props);
    const e2eBaseRepository = this.retrieveE2EBaseECRRepository(props);
    const codeRepository = this.retrieveCodeRepository(props);

    const entrypoint = new CiEntrypoint(this, "Entrypoint", {
      envSettings: props.envSettings,
      codeRepository,
    });

    new CiPipeline(this, "PipelineConfig", {
      envSettings: props.envSettings,
      codeRepository,
      backendRepository,
      webappBaseRepository,
      e2eBaseRepository,
      entrypointArtifactBucket: entrypoint.artifactsBucket,
    });
  }

  private retrieveCodeRepository(props: EnvCiStackProps) {
    return codeCommit.Repository.fromRepositoryName(
      this,
      "CodeRepository",
      GlobalCodeCommit.getCodeRepositoryName(props.envSettings)
    );
  }

  private retrieveBackendECRRepository(props: EnvCiStackProps) {
    return Repository.fromRepositoryName(
      this,
      "ECRBackendRepository",
      GlobalECR.getBackendRepositoryName(props.envSettings)
    );
  }

  private retrieveWebappBaseECRRepository(props: EnvCiStackProps) {
    return Repository.fromRepositoryName(
      this,
      "ECRWebappBaseRepository",
      BaseImagesConfig.getWebappBaseRepositoryName(props.envSettings)
    );
  }

  private retrieveE2EBaseECRRepository(props: EnvCiStackProps) {
    return Repository.fromRepositoryName(
      this,
      "ECRE2EBaseRepository",
      BaseImagesConfig.getE2EBaseRepositoryName(props.envSettings)
    );
  }
}
