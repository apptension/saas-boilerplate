/**
 * @generated SignedSource<<ae3713a8247b8c5f2ac551c59f560b38>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { Fragment, ReaderFragment } from 'relay-runtime';
export type PaymentMethodType = "ACSS_DEBIT" | "AFTERPAY_CLEARPAY" | "ALIPAY" | "AU_BECS_DEBIT" | "BACS_DEBIT" | "BANCONTACT" | "BOLETO" | "CARD" | "CARD_PRESENT" | "EPS" | "FPX" | "GIROPAY" | "GRABPAY" | "IDEAL" | "INTERAC_PRESENT" | "KLARNA" | "OXXO" | "P24" | "SEPA_DEBIT" | "SOFORT" | "WECHAT_PAY" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type stripePaymentMethodFragment$data = {
  readonly billingDetails: any | null;
  readonly card: any | null;
  readonly id: string;
  readonly pk: string | null;
  readonly type: PaymentMethodType;
  readonly " $fragmentType": "stripePaymentMethodFragment";
};
export type stripePaymentMethodFragment$key = {
  readonly " $data"?: stripePaymentMethodFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"stripePaymentMethodFragment">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "stripePaymentMethodFragment",
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
  "type": "StripePaymentMethodType",
  "abstractKey": null
};

(node as any).hash = "6aeca21adc2e0a1dd77191db8b802dbf";

export default node;
