/**
 * @generated SignedSource<<53745289d4b2cf08b8869a661022249b>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type DeletePaymentMethodMutationInput = {
  clientMutationId?: string | null;
  id?: string | null;
};
export type stripeDeletePaymentMethodMutation$variables = {
  connections: ReadonlyArray<string>;
  input: DeletePaymentMethodMutationInput;
};
export type stripeDeletePaymentMethodMutation$data = {
  readonly deletePaymentMethod: {
    readonly activeSubscription: {
      readonly defaultPaymentMethod: {
        readonly " $fragmentSpreads": FragmentRefs<"stripePaymentMethodFragment">;
      } | null;
    } | null;
    readonly deletedIds: ReadonlyArray<string | null> | null;
  } | null;
};
export type stripeDeletePaymentMethodMutation = {
  response: stripeDeletePaymentMethodMutation$data;
  variables: stripeDeletePaymentMethodMutation$variables;
};

const node: ConcreteRequest = (function(){
var v0 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "connections"
},
v1 = {
  "defaultValue": null,
  "kind": "LocalArgument",
  "name": "input"
},
v2 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedIds",
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
    "argumentDefinitions": [
      (v0/*: any*/),
      (v1/*: any*/)
    ],
    "kind": "Fragment",
    "metadata": null,
    "name": "stripeDeletePaymentMethodMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeletePaymentMethodMutationPayload",
        "kind": "LinkedField",
        "name": "deletePaymentMethod",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionScheduleType",
            "kind": "LinkedField",
            "name": "activeSubscription",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "defaultPaymentMethod",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "stripePaymentMethodFragment"
                  }
                ],
                "storageKey": null
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
    "argumentDefinitions": [
      (v1/*: any*/),
      (v0/*: any*/)
    ],
    "kind": "Operation",
    "name": "stripeDeletePaymentMethodMutation",
    "selections": [
      {
        "alias": null,
        "args": (v2/*: any*/),
        "concreteType": "DeletePaymentMethodMutationPayload",
        "kind": "LinkedField",
        "name": "deletePaymentMethod",
        "plural": false,
        "selections": [
          (v3/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedIds",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          },
          {
            "alias": null,
            "args": null,
            "concreteType": "SubscriptionScheduleType",
            "kind": "LinkedField",
            "name": "activeSubscription",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "StripePaymentMethodType",
                "kind": "LinkedField",
                "name": "defaultPaymentMethod",
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
    "cacheID": "c67da08d23ced950062d6d6edb64071e",
    "id": null,
    "metadata": {},
    "name": "stripeDeletePaymentMethodMutation",
    "operationKind": "mutation",
    "text": "mutation stripeDeletePaymentMethodMutation(\n  $input: DeletePaymentMethodMutationInput!\n) {\n  deletePaymentMethod(input: $input) {\n    deletedIds\n    activeSubscription {\n      defaultPaymentMethod {\n        ...stripePaymentMethodFragment\n        id\n      }\n      id\n    }\n  }\n}\n\nfragment stripePaymentMethodFragment on StripePaymentMethodType {\n  id\n  pk\n  type\n  card\n  billingDetails\n}\n"
  }
};
})();

(node as any).hash = "2ee1283ee14fd1be38705543fa1e28bc";

export default node;
