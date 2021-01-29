import { Construct } from "@aws-cdk/core";
import { EnvConstructProps } from "../../../types";
import { Secret } from "@aws-cdk/aws-secretsmanager";

export class GlobalBuildSecrets extends Construct {
  secret: Secret;

  constructor(scope: Construct, id: string, props: EnvConstructProps) {
    super(scope, id);

    this.secret = new Secret(this, "Secret", {
      description: "Build Secrets",
      secretName: "GlobalBuildSecrets",
    });
  }
}
