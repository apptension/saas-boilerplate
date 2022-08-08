/**
 * @generated SignedSource<<3af443dda72e18738ecf0bc5b1e263e7>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Query } from 'relay-runtime';
export type demoItemQuery$variables = {
  id: string;
};
export type demoItemQuery$data = {
  readonly demoItem: {
    readonly description: string | null;
    readonly image: {
      readonly description: string | null;
      readonly title: string | null;
      readonly url: string | null;
    } | null;
    readonly title: string | null;
  } | null;
};
export type demoItemQuery = {
  response: demoItemQuery$data;
  variables: demoItemQuery$variables;
};

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "title",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "description",
  "storageKey": null
},
v3 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "id",
        "variableName": "id"
      }
    ],
    "concreteType": "DemoItem",
    "kind": "LinkedField",
    "name": "demoItem",
    "plural": false,
    "selections": [
      (v1/*: any*/),
      (v2/*: any*/),
      {
        "alias": null,
        "args": null,
        "concreteType": "Asset",
        "kind": "LinkedField",
        "name": "image",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "url",
            "storageKey": null
          },
          (v1/*: any*/),
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "demoItemQuery",
    "selections": (v3/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "demoItemQuery",
    "selections": (v3/*: any*/)
  },
  "params": {
    "cacheID": "00eb8e7d77bce2b2822c2e496c692fd8",
    "id": null,
    "metadata": {},
    "name": "demoItemQuery",
    "operationKind": "query",
    "text": "query demoItemQuery(\n  $id: String!\n) {\n  demoItem(id: $id) {\n    title\n    description\n    image {\n      url\n      title\n      description\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "2c57f8e089a3f7f7a9bbc01c43dab83f";

export default node;
