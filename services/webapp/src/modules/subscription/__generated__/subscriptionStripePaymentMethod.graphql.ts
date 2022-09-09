/**
 * @generated SignedSource<<2fae950ca28f71ed2517024e27135c47>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PaymentMethodType = "ACSS_DEBIT" | "AFTERPAY_CLEARPAY" | "ALIPAY" | "AU_BECS_DEBIT" | "BACS_DEBIT" | "BANCONTACT" | "BOLETO" | "CARD" | "CARD_PRESENT" | "EPS" | "FPX" | "GIROPAY" | "GRABPAY" | "IDEAL" | "INTERAC_PRESENT" | "KLARNA" | "OXXO" | "P24" | "SEPA_DEBIT" | "SOFORT" | "WECHAT_PAY" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type subscriptionStripePaymentMethod$data = {
  readonly billingDetails: any | null;
  readonly card: any | null;
  readonly id: string;
  readonly type: PaymentMethodType;
  readonly " $fragmentType": "subscriptionStripePaymentMethod";
};
export type subscriptionStripePaymentMethod$key = {
  readonly " $data"?: subscriptionStripePaymentMethod$data;
  readonly " $fragmentSpreads": FragmentRefs<"subscriptionStripePaymentMethod">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "subscriptionStripePaymentMethod",
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
      "name": "billingDetails",
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
    }
  ],
  "type": "StripePaymentMethodType",
  "abstractKey": null
};

(node as any).hash = "94a7d21d6c32f358c18a937ae9dca444";

export default node;
