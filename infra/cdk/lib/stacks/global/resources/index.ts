import { Construct } from "@aws-cdk/core";

import { EnvConstructProps } from "../../../types";
import { GlobalECR } from "./globalECR";
import { GlobalCodeCommit } from "./globalCodeCommit";
import { GlobalBuildSecrets } from "./globalBuildSecrets";

export class GlobalResources extends Construct {
  ecr: GlobalECR;
  codeCommit: GlobalCodeCommit;
  buildSecrets: GlobalBuildSecrets;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.ecr = new GlobalECR(this, "ECRGlobal", props);
    this.codeCommit = new GlobalCodeCommit(this, "CodeCommit", props);
    this.buildSecrets = new GlobalBuildSecrets(
      this,
      "GlobalBuildSecrets",
      props
    );
  }
}
