import {Construct} from "@aws-cdk/core";

import {EnvConstructProps} from '../../../types'
import {GlobalECR} from './globalECR';
import {GlobalCodeCommit} from './globalCodeCommit';


export class GlobalResources extends Construct {
    ecr: GlobalECR;
    codeCommit: GlobalCodeCommit;

    constructor(scope: Construct, id: string, props: EnvConstructProps) {
        super(scope, id);

        this.ecr = new GlobalECR(this, "ECRGlobal", props);
        this.codeCommit = new GlobalCodeCommit(this, "CodeCommit", props);
    }
}
