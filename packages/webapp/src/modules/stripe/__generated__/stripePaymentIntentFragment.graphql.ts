/**
 * @generated SignedSource<<22086d5bfde7e6ba5be545a274ef8183>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type stripePaymentIntentFragment$data = {
  readonly amount: number;
  readonly clientSecret: string;
  readonly currency: string;
  readonly id: string;
  readonly pk: string | null;
  readonly " $fragmentType": "stripePaymentIntentFragment";
};
export type stripePaymentIntentFragment$key = {
  readonly " $data"?: stripePaymentIntentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"stripePaymentIntentFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "stripePaymentIntentFragment"
};

(node as any).hash = "143b9b6d9fd746b7ac37010eaf34f3d0";

export default node;
