/**
 * @generated SignedSource<<65e262d2a4f12d73b069cc56dabcc963>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type configContentfulAppConfigQuery$variables = {};
export type configContentfulAppConfigQuery$data = {
  readonly appConfigCollection: {
    readonly items: ReadonlyArray<{
      readonly name: string | null;
      readonly privacyPolicy: string | null;
      readonly termsAndConditions: string | null;
    } | null>;
  } | null;
};
export type configContentfulAppConfigQuery = {
  response: configContentfulAppConfigQuery$data;
  variables: configContentfulAppConfigQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Literal",
        "name": "limit",
        "value": 1
      }
    ],
    "concreteType": "AppConfigCollection",
    "kind": "LinkedField",
    "name": "appConfigCollection",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "AppConfig",
        "kind": "LinkedField",
        "name": "items",
        "plural": true,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "privacyPolicy",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "termsAndConditions",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": "appConfigCollection(limit:1)"
  }
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "configContentfulAppConfigQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "configContentfulAppConfigQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "d86df28cd3ec3d24c560268ccdc641d3",
    "id": null,
    "metadata": {},
    "name": "configContentfulAppConfigQuery",
    "operationKind": "query",
    "text": "query configContentfulAppConfigQuery {\n  appConfigCollection(limit: 1) {\n    items {\n      name\n      privacyPolicy\n      termsAndConditions\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "4ea9b962811f69c5bcc14ce60566becb";

export default node;
