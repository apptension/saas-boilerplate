import * as fs from "fs";
import * as core from '@aws-cdk/core';
import {IHostedZone, PublicHostedZone} from "@aws-cdk/aws-route53";
import {Source} from "@aws-cdk/aws-s3-deployment";

import {EnvConstructProps} from "../../types";
import {WebAppCloudFrontDistribution} from "../../patterns/webAppCloudFrontDistribution";
import {Bucket, BucketAccessControl, HttpMethods} from "@aws-cdk/aws-s3";
import {DnsValidatedCertificate, ICertificate} from "@aws-cdk/aws-certificatemanager";
import {UsEastResourcesStack} from "../usEastResources";


export interface GlobalToolsStackProps extends core.StackProps, EnvConstructProps {
}

export class GlobalToolsStack extends core.Stack {
    private versionMatrixCloudFrontDistribution: WebAppCloudFrontDistribution;

    constructor(scope: core.App, id: string, props: GlobalToolsStackProps) {
        super(scope, id, props);

        const domainZone = PublicHostedZone.fromHostedZoneAttributes(this, "DomainZone", {
            hostedZoneId: props.envSettings.tools.hostedZone.id,
            zoneName: props.envSettings.tools.hostedZone.name,
        });

        const domainName = props.envSettings.tools.hostedZone.name;
        const certificate = new DnsValidatedCertificate(this, "ToolsCertificate", {
            region: 'us-east-1',
            domainName: domainName,
            subjectAlternativeNames: [`*.${domainName}`],
            hostedZone: domainZone
        });

        this.createVersionMatrixTool(props, domainZone, certificate);
    }

    private createVersionMatrixTool(props: GlobalToolsStackProps, domainZone: IHostedZone, certificate: ICertificate) {
        new Bucket(this, "VersionMatrixBucket", {
            bucketName: `${props.envSettings.projectName}-version-matrix`,
            publicReadAccess: true,
            accessControl: BucketAccessControl.PUBLIC_READ,
            cors: [{
                allowedMethods: [HttpMethods.GET, HttpMethods.HEAD],
                allowedOrigins: [`https://${props.envSettings.tools.domains.versionMatrix}`],
            }]
        })

        const filesPath = `${props.envSettings.projectRootDir}/tools/version-matrix/build`;
        if (fs.existsSync(filesPath)) {
            this.versionMatrixCloudFrontDistribution = new WebAppCloudFrontDistribution(this, "WebApp", {
                sources: [Source.asset(filesPath)],
                domainZone,
                domainName: props.envSettings.tools.domains.versionMatrix,
                certificateArn: certificate.certificateArn,
                authLambdaSSMParameterName: UsEastResourcesStack.getAuthLambdaVersionArnSSMParameterName(props.envSettings),
                basicAuth: props.envSettings.tools.basicAuth,
            });
        }
    }
}
