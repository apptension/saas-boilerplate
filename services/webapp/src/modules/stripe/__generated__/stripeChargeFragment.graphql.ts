/**
 * @generated SignedSource<<5c4db5f8cd9d38e9c3bfa01e89bc43ab>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type stripeChargeFragment$data = {
  readonly amount: any;
  readonly billingDetails: any | null;
  readonly created: String | null;
  readonly id: string;
  readonly invoice: {
    readonly id: string;
    readonly subscription: {
      readonly plan: {
        readonly " $fragmentSpreads": FragmentRefs<"subscriptionPlanItemFragment">;
      } | null;
    } | null;
  } | null;
  readonly paymentMethod: {
    readonly " $fragmentSpreads": FragmentRefs<"stripePaymentMethodFragment">;
  } | null;
  readonly " $fragmentType": "stripeChargeFragment";
};
export type stripeChargeFragment$key = {
  readonly " $data"?: stripeChargeFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"stripeChargeFragment">;
};

const node: ReaderFragment = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "stripeChargeFragment",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "created",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "billingDetails",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "StripePaymentMethodType",
      "kind": "LinkedField",
      "name": "paymentMethod",
      "plural": false,
      "selections": [
        {
          "args": null,
          "kind": "FragmentSpread",
          "name": "stripePaymentMethodFragment"
        }
      ],
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "amount",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "StripeInvoiceType",
      "kind": "LinkedField",
      "name": "invoice",
      "plural": false,
      "selections": [
        (v0/*: any*/),
        {
          "alias": null,
          "args": null,
          "concreteType": "StripeSubscriptionType",
          "kind": "LinkedField",
          "name": "subscription",
          "plural": false,
          "selections": [
            {
              "alias": null,
              "args": null,
              "concreteType": "SubscriptionPlanType",
              "kind": "LinkedField",
              "name": "plan",
              "plural": false,
              "selections": [
                {
                  "args": null,
                  "kind": "FragmentSpread",
                  "name": "subscriptionPlanItemFragment"
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
  "type": "StripeChargeType",
  "abstractKey": null
};
})();

(node as any).hash = "bc4374cb8cd3bcc06465161848f004d4";

export default node;
