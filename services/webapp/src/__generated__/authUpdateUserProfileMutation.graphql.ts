/**
 * @generated SignedSource<<c664f9ca3661396f4f3f6820a633bf60>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest, Mutation } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type UpdateCurrentUserMutationInput = {
  avatar?: any | null;
  clientMutationId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};
export type authUpdateUserProfileMutation$variables = {
  input: UpdateCurrentUserMutationInput;
};
export type authUpdateUserProfileMutation$data = {
  readonly updateCurrentUser: {
    readonly userProfile: {
      readonly id: string;
      readonly user: {
        readonly " $fragmentSpreads": FragmentRefs<"commonQueryCurrentUserFragment">;
      };
    } | null;
  } | null;
};
export type authUpdateUserProfileMutation = {
  response: authUpdateUserProfileMutation$data;
  variables: authUpdateUserProfileMutation$variables;
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
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "authUpdateUserProfileMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateCurrentUserMutationPayload",
        "kind": "LinkedField",
        "name": "updateCurrentUser",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserProfileType",
            "kind": "LinkedField",
            "name": "userProfile",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "CurrentUserType",
                "kind": "LinkedField",
                "name": "user",
                "plural": false,
                "selections": [
                  {
                    "args": null,
                    "kind": "FragmentSpread",
                    "name": "commonQueryCurrentUserFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "authUpdateUserProfileMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "UpdateCurrentUserMutationPayload",
        "kind": "LinkedField",
        "name": "updateCurrentUser",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "UserProfileType",
            "kind": "LinkedField",
            "name": "userProfile",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "CurrentUserType",
                "kind": "LinkedField",
                "name": "user",
                "plural": false,
                "selections": [
                  (v2/*: any*/),
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "email",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "firstName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "lastName",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "roles",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "avatar",
                    "storageKey": null
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
    ]
  },
  "params": {
    "cacheID": "6b9b6bcf6c21435ae1a352666083c171",
    "id": null,
    "metadata": {},
    "name": "authUpdateUserProfileMutation",
    "operationKind": "mutation",
    "text": "mutation authUpdateUserProfileMutation(\n  $input: UpdateCurrentUserMutationInput!\n) {\n  updateCurrentUser(input: $input) {\n    userProfile {\n      id\n      user {\n        ...commonQueryCurrentUserFragment\n        id\n      }\n    }\n  }\n}\n\nfragment commonQueryCurrentUserFragment on CurrentUserType {\n  id\n  email\n  firstName\n  lastName\n  roles\n  avatar\n}\n"
  }
};
})();

(node as any).hash = "60d4bd1a0d2bca68d605fd6de91c8c71";

export default node;
