/**
 * @generated SignedSource<<9870531f0f6dfcf2a185b07d147648cd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
export type MarkReadAllNotificationsMutationInput = {
  clientMutationId?: string | null;
};
export type notificationsListMarkAsReadMutation$variables = {
  input: MarkReadAllNotificationsMutationInput;
};
export type notificationsListMarkAsReadMutation$data = {
  readonly markReadAllNotifications: {
    readonly ok: boolean | null;
  } | null;
};
export type notificationsListMarkAsReadMutation = {
  response: notificationsListMarkAsReadMutation$data;
  variables: notificationsListMarkAsReadMutation$variables;
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
    "concreteType": "MarkReadAllNotificationsMutationPayload",
    "kind": "LinkedField",
    "name": "markReadAllNotifications",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "ok",
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
    "name": "notificationsListMarkAsReadMutation",
    "selections": (v1/*: any*/),
    "type": "ApiMutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "notificationsListMarkAsReadMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "28adfc6e0796c3ef2921d13c1758c78a",
    "id": null,
    "metadata": {},
    "name": "notificationsListMarkAsReadMutation",
    "operationKind": "mutation",
    "text": "mutation notificationsListMarkAsReadMutation(\n  $input: MarkReadAllNotificationsMutationInput!\n) {\n  markReadAllNotifications(input: $input) {\n    ok\n  }\n}\n"
  }
};
})();

(node as any).hash = "c13a642c1b666f7c94df2c6bdcc7681b";

export default node;
