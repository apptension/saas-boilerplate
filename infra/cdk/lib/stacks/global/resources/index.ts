import {Construct} from "@aws-cdk/core";
import {GlobalECR} from './ecr';
import {EnvConstructProps} from '../../../types'


export class GlobalResources extends Construct {
    ecr: GlobalECR;

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.ecr = new GlobalECR(this, "ECRGlobal", props)
    }
}
