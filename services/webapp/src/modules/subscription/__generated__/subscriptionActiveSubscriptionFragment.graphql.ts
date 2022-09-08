/**
 * @generated SignedSource<<46841ff7f57d45e8aaaa3e89550dd4fd>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type subscriptionActiveSubscriptionFragment$data = {
  readonly canActivateTrial: boolean | null;
  readonly phases: ReadonlyArray<{
    readonly endDate: string | null;
    readonly item: {
      readonly price: {
        readonly " $fragmentSpreads": FragmentRefs<"subscriptionPlanItemFragment">;
      } | null;
      readonly quantity: number | null;
    } | null;
    readonly startDate: String | null;
    readonly trialEnd: string | null;
  } | null> | null;
  readonly subscription: {
    readonly startDate: String | null;
    readonly trialEnd: String | null;
    readonly trialStart: String | null;
  } | null;
  readonly " $fragmentType": "subscriptionActiveSubscriptionFragment";
};
export type subscriptionActiveSubscriptionFragment$key = {
  readonly " $data"?: subscriptionActiveSubscriptionFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"subscriptionActiveSubscriptionFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "startDate",
  "storageKey": null
},
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "trialEnd",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "subscriptionActiveSubscriptionFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "SubscriptionSchedulePhaseType",
      "kind": "LinkedField",
      "name": "phases",
      "plural": true,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "endDate",
          "storageKey": null
        },
        (v1/*: any*/),
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
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "subscriptionPlanItemFragment"
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
        (v0/*: any*/),
        (v1/*: any*/),
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "trialStart",
          "storageKey": null
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "canActivateTrial",
      "storageKey": null
    }
  ],
  "type": "SubscriptionScheduleType",
  "abstractKey": null
};
})();

(node as any).hash = "ae6ce43163446fa5839fbde53a11bd9b";

export default node;
