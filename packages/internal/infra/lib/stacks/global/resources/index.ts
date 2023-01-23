import {Construct} from "constructs";

import {EnvConstructProps} from "../../../types";
import {GlobalECR} from "./globalECR";
import {GlobalCodeCommit} from "./globalCodeCommit";
import {GlobalBuildSecrets} from "./globalBuildSecrets";
import {BaseImagesConfig} from "./baseImagesConfig";
import {User} from "aws-cdk-lib/aws-iam";

export class GlobalResources extends Construct {
  ecr: GlobalECR;
  codeCommit: GlobalCodeCommit;
  buildSecrets: GlobalBuildSecrets;
  externalCiUser: User;
  baseImagesConfig: BaseImagesConfig;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.ecr = new GlobalECR(this, "ECRGlobal", props);
    this.codeCommit = new GlobalCodeCommit(this, "CodeCommit", props);
    this.buildSecrets = new GlobalBuildSecrets(
      this,
      "GlobalBuildSecrets",
      props
    );    
    this.externalCiUser = new User(this, "ExternalCiUser", {
      userName: "external-ci",
    });

    this.baseImagesConfig = new BaseImagesConfig(this, "BaseImages", {
      codeRepository: this.codeCommit.repository,
      envSettings: props.envSettings,
      externalCiUser: this.externalCiUser,
    });
  }
}
