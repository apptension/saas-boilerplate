import * as fs from "fs";
import {App, Stack, StackProps} from "aws-cdk-lib";
import {Source} from "aws-cdk-lib/aws-s3-deployment";

import {EnvConstructProps} from "../../../types";
import {WebAppCloudFrontDistribution} from "../../../patterns/webAppCloudFrontDistribution";
import {UsEastResourcesStack} from "../../usEastResources";
import {getCloudfrontCertificateArn, getHostedZone} from "../../../helpers/domains";

export interface DocsStackProps extends StackProps, EnvConstructProps {}

export class DocsStack extends Stack {
  webAppCloudFrontDistribution: WebAppCloudFrontDistribution;

  constructor(scope: App, id: string, props: DocsStackProps) {
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
