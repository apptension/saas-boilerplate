import * as fs from "fs";
import * as core from "@aws-cdk/core";
import {Source} from "@aws-cdk/aws-s3-deployment";

import {EnvConstructProps} from "../../../types";
import {WebAppCloudFrontDistribution} from "../../../patterns/webAppCloudFrontDistribution";
import {UsEastResourcesStack} from "../../usEastResources";
import {getCloudfrontCertificateArn, getHostedZone} from "../../../helpers/domains";

export interface DocsStackProps extends core.StackProps, EnvConstructProps {}

export class DocsStack extends core.Stack {
  webAppCloudFrontDistribution: WebAppCloudFrontDistribution;

  constructor(scope: core.App, id: string, props: DocsStackProps) {
    super(scope, id, props);

    const domainZone = getHostedZone(this, props.envSettings);
    const certificateArn = getCloudfrontCertificateArn(props.envSettings);

    const filesPath = `${props.envSettings.projectRootDir}/services/docs/build`;
    if (fs.existsSync(filesPath)) {
      this.webAppCloudFrontDistribution = new WebAppCloudFrontDistribution(
        this,
        "DocsWebApp",
        {
          sources: [Source.asset(filesPath)],
          domainZone,
          domainName: props.envSettings.domains.docs,
          apiDomainName: props.envSettings.domains.api,
          certificateArn,
          authLambdaSSMParameterName: UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(
            props.envSettings
          ),
          distributionPaths: ["/*"],
        }
      );
    }
  }
}
