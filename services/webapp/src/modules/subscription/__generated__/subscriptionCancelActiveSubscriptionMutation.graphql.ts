/**
 * @generated SignedSource<<ca39d0262199d0bacdc476c9f6605546>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type CancelActiveSubscriptionMutationInput = {
  clientMutationId?: string | null;
};
export type subscriptionCancelActiveSubscriptionMutation$variables = {
  input: CancelActiveSubscriptionMutationInput;
};
export type subscriptionCancelActiveSubscriptionMutation$data = {
  readonly cancelActiveSubscription: {
    readonly subscriptionSchedule: {
      readonly " $fragmentSpreads": FragmentRefs<"subscriptionActiveSubscriptionFragment">;
    } | null;
  } | null;
};
export type subscriptionCancelActiveSubscriptionMutation = {
  response: subscriptionCancelActiveSubscriptionMutation$data;
  variables: subscriptionCancelActiveSubscriptionMutation$variables;
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "trialEnd",
  "storageKey": null
},
v4 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "subscriptionCancelActiveSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CancelActiveSubscriptionMutationPayload",
        "kind": "LinkedField",
        "name": "cancelActiveSubscription",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionScheduleType",
            "kind": "LinkedField",
            "name": "subscriptionSchedule",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "subscriptionActiveSubscriptionFragment"
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
    "name": "subscriptionCancelActiveSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CancelActiveSubscriptionMutationPayload",
        "kind": "LinkedField",
        "name": "cancelActiveSubscription",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionScheduleType",
            "kind": "LinkedField",
            "name": "subscriptionSchedule",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "SubscriptionSchedulePhaseType",
                "kind": "LinkedField",
                "name": "phases",
                "plural": true,
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "endDate",
                    "storageKey": null
                  },
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "concreteType": "SubscriptionSchedulePhaseItemType",
                    "kind": "LinkedField",
                    "name": "item",
                    "plural": false,
                    "selections": [
                      {
                        "alias": null,
                        "args": null,
                        "concreteType": "SubscriptionPlanType",
                        "kind": "LinkedField",
                        "name": "price",
                        "plural": false,
                        "selections": [
                          (v4/*: any*/),
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "pk",
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "concreteType": "StripeProductType",
                            "kind": "LinkedField",
                            "name": "product",
                            "plural": false,
                            "selections": [
                              (v4/*: any*/),
                              {
                                "alias": null,
                                "args": null,
                                "kind": "ScalarField",
                                "name": "name",
                                "storageKey": null
                              }
                            ],
                            "storageKey": null
                          },
                          {
                            "alias": null,
                            "args": null,
                            "kind": "ScalarField",
                            "name": "unitAmount",
                            "storageKey": null
                          }
                        ],
                        "storageKey": null
                      },
                      {
                        "alias": null,
                        "args": null,
                        "kind": "ScalarField",
                        "name": "quantity",
                        "storageKey": null
                      }
                    ],
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "StripeSubscriptionType",
                "kind": "LinkedField",
                "name": "subscription",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "trialStart",
                    "storageKey": null
                  },
                  (v4/*: any*/)
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "canActivateTrial",
                "storageKey": null
              },
              (v4/*: any*/)
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "155c0f7556e402830f8d722456ecef3f",
    "id": null,
    "metadata": {},
    "name": "subscriptionCancelActiveSubscriptionMutation",
    "operationKind": "mutation",
    "text": "mutation subscriptionCancelActiveSubscriptionMutation(\n  $input: CancelActiveSubscriptionMutationInput!\n) {\n  cancelActiveSubscription(input: $input) {\n    subscriptionSchedule {\n      ...subscriptionActiveSubscriptionFragment\n      id\n    }\n  }\n}\n\nfragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n  phases {\n    startDate\n    endDate\n    trialEnd\n    item {\n      price {\n        ...subscriptionPlanItemFragment\n        id\n      }\n      quantity\n    }\n  }\n  subscription {\n    startDate\n    trialEnd\n    trialStart\n    id\n  }\n  canActivateTrial\n}\n\nfragment subscriptionPlanItemFragment on SubscriptionPlanType {\n  id\n  pk\n  product {\n    id\n    name\n  }\n  unitAmount\n}\n"
  }
};
})();

(node as any).hash = "23aa8d3f14d5387b4ee9f63b5cf2ee5c";

export default node;
