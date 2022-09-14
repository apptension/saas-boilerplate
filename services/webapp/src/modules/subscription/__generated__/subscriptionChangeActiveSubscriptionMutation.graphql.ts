/**
 * @generated SignedSource<<7df1e0c635c878c3ec41208f70763907>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type ChangeActiveSubscriptionMutationInput = {
  clientMutationId?: string | null;
  price: string;
};
export type subscriptionChangeActiveSubscriptionMutation$variables = {
  input: ChangeActiveSubscriptionMutationInput;
};
export type subscriptionChangeActiveSubscriptionMutation$data = {
  readonly changeActiveSubscription: {
    readonly subscriptionSchedule: {
      readonly " $fragmentSpreads": FragmentRefs<"subscriptionActiveSubscriptionFragment">;
    } | null;
  } | null;
};
export type subscriptionChangeActiveSubscriptionMutation = {
  response: subscriptionChangeActiveSubscriptionMutation$data;
  variables: subscriptionChangeActiveSubscriptionMutation$variables;
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
},
v5 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "pk",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "subscriptionChangeActiveSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ChangeActiveSubscriptionMutationPayload",
        "kind": "LinkedField",
        "name": "changeActiveSubscription",
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
    "name": "subscriptionChangeActiveSubscriptionMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "ChangeActiveSubscriptionMutationPayload",
        "kind": "LinkedField",
        "name": "changeActiveSubscription",
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
                          (v5/*: any*/),
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
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "defaultPaymentMethod",
                "plural": false,
                "selections": [
                  (v4/*: any*/),
                  (v5/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "type",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "card",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "billingDetails",
                    "storageKey": null
                  }
                ],
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
    "cacheID": "f28b7d55b1d9fa8ac7b678240a242d7a",
    "id": null,
    "metadata": {},
    "name": "subscriptionChangeActiveSubscriptionMutation",
    "operationKind": "mutation",
    "text": "mutation subscriptionChangeActiveSubscriptionMutation(\n  $input: ChangeActiveSubscriptionMutationInput!\n) {\n  changeActiveSubscription(input: $input) {\n    subscriptionSchedule {\n      ...subscriptionActiveSubscriptionFragment\n      id\n    }\n  }\n}\n\nfragment stripePaymentMethodFragment on StripePaymentMethodType {\n  id\n  pk\n  type\n  card\n  billingDetails\n}\n\nfragment subscriptionActiveSubscriptionFragment on SubscriptionScheduleType {\n  phases {\n    startDate\n    endDate\n    trialEnd\n    item {\n      price {\n        ...subscriptionPlanItemFragment\n        id\n      }\n      quantity\n    }\n  }\n  subscription {\n    startDate\n    trialEnd\n    trialStart\n    id\n  }\n  canActivateTrial\n  defaultPaymentMethod {\n    ...stripePaymentMethodFragment\n    id\n  }\n}\n\nfragment subscriptionPlanItemFragment on SubscriptionPlanType {\n  id\n  pk\n  product {\n    id\n    name\n  }\n  unitAmount\n}\n"
  }
};
})();

(node as any).hash = "133eb91bc79eb07f9c76e6d5ba00ee7b";

export default node;
