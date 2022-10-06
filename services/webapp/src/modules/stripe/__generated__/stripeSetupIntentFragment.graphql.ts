/**
 * @generated SignedSource<<0615b8eb685cf3e184f22b28da994b89>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { InlineFragment, ReaderInlineDataFragment } from 'relay-runtime';
import { FragmentRefs } from "relay-runtime";
export type stripeSetupIntentFragment$data = {
  readonly clientSecret: string;
  readonly id: string;
  readonly " $fragmentType": "stripeSetupIntentFragment";
};
export type stripeSetupIntentFragment$key = {
  readonly " $data"?: stripeSetupIntentFragment$data;
  readonly " $fragmentSpreads": FragmentRefs<"stripeSetupIntentFragment">;
};

const node: ReaderInlineDataFragment = {
  "kind": "InlineDataFragment",
  "name": "stripeSetupIntentFragment"
};

(node as any).hash = "47a2a5e71ff29acf5b00d3bfe91aaf24";

export default node;
