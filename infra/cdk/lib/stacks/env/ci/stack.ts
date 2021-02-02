import * as core from "@aws-cdk/core";
import { StackProps } from "@aws-cdk/core";
import { Repository } from "@aws-cdk/aws-ecr";
import * as codeCommit from "@aws-cdk/aws-codecommit";

import { EnvConstructProps } from "../../../types";
import { GlobalECR } from "../../global/resources/globalECR";
import { GlobalCodeCommit } from "../../global/resources/globalCodeCommit";
import { CiPipeline } from "./ciPipeline";
import { CiEntrypoint } from "./ciEntrypoint";
import { BaseImagesConfig } from "../../global/resources/baseImagesConfig";

export interface EnvCiStackProps extends StackProps, EnvConstructProps {}

export class EnvCiStack extends core.Stack {
  constructor(scope: core.App, id: string, props: EnvCiStackProps) {
    super(scope, id, props);

    const backendRepository = this.retrieveBackendECRRepository(props);
    const webappBaseRepository = this.retrieveWebappBaseECRRepository(props);
    const codeRepository = this.retrieveCodeRepository(props);

    const entrypoint = new CiEntrypoint(this, "Entrypoint", {
      envSettings: props.envSettings,
      codeRepository,
    });

    new CiPipeline(this, "PipelineConfig", {
      envSettings: props.envSettings,
      backendRepository,
      webappBaseRepository,
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
}
