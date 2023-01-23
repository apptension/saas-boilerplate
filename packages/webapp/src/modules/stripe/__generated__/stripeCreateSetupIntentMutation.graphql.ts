/**
 * @generated SignedSource<<18070452c384ee413e625b1ad1fd7544>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CreateSetupIntentMutationInput = {
  clientMutationId?: string | null;
};
export type stripeCreateSetupIntentMutation$variables = {
  input: CreateSetupIntentMutationInput;
};
export type stripeCreateSetupIntentMutation$data = {
  readonly createSetupIntent: {
    readonly setupIntent: {
      readonly " $fragmentSpreads": FragmentRefs<"stripeSetupIntentFragment">;
    } | null;
  } | null;
};
export type stripeCreateSetupIntentMutation = {
  response: stripeCreateSetupIntentMutation$data;
  variables: stripeCreateSetupIntentMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "id",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "clientSecret",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "stripeCreateSetupIntentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateSetupIntentMutationPayload",
        "kind": "LinkedField",
        "name": "createSetupIntent",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "StripeSetupIntentType",
            "kind": "LinkedField",
            "name": "setupIntent",
            "plural": false,
            "selections": [
              {
                "kind": "InlineDataFragmentSpread",
                "name": "stripeSetupIntentFragment",
                "selections": (v2/*: any*/),
                "args": null,
                "argumentDefinitions": []
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "stripeCreateSetupIntentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CreateSetupIntentMutationPayload",
        "kind": "LinkedField",
        "name": "createSetupIntent",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "StripeSetupIntentType",
            "kind": "LinkedField",
            "name": "setupIntent",
            "plural": false,
            "selections": (v2/*: any*/),
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "3b441dac6c7ac17548253a3846889034",
    "id": null,
    "metadata": {},
    "name": "stripeCreateSetupIntentMutation",
    "operationKind": "mutation",
    "text": "mutation stripeCreateSetupIntentMutation(\n  $input: CreateSetupIntentMutationInput!\n) {\n  createSetupIntent(input: $input) {\n    setupIntent {\n      ...stripeSetupIntentFragment\n      id\n    }\n  }\n}\n\nfragment stripeSetupIntentFragment on StripeSetupIntentType {\n  id\n  clientSecret\n}\n"
  }
};
})();

(node as any).hash = "f19dd9ced135ad3f609fa6c7447acdb3";

export default node;
