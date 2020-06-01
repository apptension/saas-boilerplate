import {Construct} from "@aws-cdk/core";
import {IRepository} from "@aws-cdk/aws-codecommit";

import {EnvConstructProps} from '../../../types'
import {CiEntrypoint} from './ciEntrypoint';
import {CiPipeline} from "./ciPipeline";

export interface GlobalCiProps extends EnvConstructProps {
    codeRepository: IRepository;
}

export class GlobalCi extends Construct {
    ciEntrypoint: CiEntrypoint;
    ciPipeline: CiPipeline;

    constructor(scope: Construct, id: string, props: GlobalCiProps) {
        super(scope, id);

        this.ciEntrypoint = new CiEntrypoint(this, 'Entrypoint', {
            envSettings: props.envSettings,
            codeRepository: props.codeRepository,
        });

        this.ciPipeline = new CiPipeline(this, "CiPipeline", {
            envSettings: props.envSettings,
            entrypointArtifactBucket: this.ciEntrypoint.artifactsBucket,
        });
    }
}
