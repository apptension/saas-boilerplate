/**
 * @generated SignedSource<<a64a63c0ff897e98c69c4e2538038777>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type UpdateCrudDemoItemMutationInput = {
  clientMutationId?: string | null;
  createdBy?: string | null;
  id: string;
  name: string;
};
export type editCrudDemoItemContentMutation$variables = {
  input: UpdateCrudDemoItemMutationInput;
};
export type editCrudDemoItemContentMutation$data = {
  readonly updateCrudDemoItem: {
    readonly crudDemoItem: {
      readonly id: string;
      readonly name: string;
    } | null;
  } | null;
};
export type editCrudDemoItemContentMutation = {
  response: editCrudDemoItemContentMutation$data;
  variables: editCrudDemoItemContentMutation$variables;
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
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "UpdateCrudDemoItemMutationPayload",
    "kind": "LinkedField",
    "name": "updateCrudDemoItem",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "CrudDemoItemType",
        "kind": "LinkedField",
        "name": "crudDemoItem",
        "plural": false,
        "selections": [
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
            "name": "name",
            "storageKey": null
          }
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
    "name": "editCrudDemoItemContentMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "editCrudDemoItemContentMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "418738e05b13c4f82b558f39e7e5589a",
    "id": null,
    "metadata": {},
    "name": "editCrudDemoItemContentMutation",
    "operationKind": "mutation",
    "text": "mutation editCrudDemoItemContentMutation(\n  $input: UpdateCrudDemoItemMutationInput!\n) {\n  updateCrudDemoItem(input: $input) {\n    crudDemoItem {\n      id\n      name\n    }\n  }\n}\n"
  }
};
})();

(node as any).hash = "017ba379de1cf90af6eecdadbfd1220f";

export default node;
