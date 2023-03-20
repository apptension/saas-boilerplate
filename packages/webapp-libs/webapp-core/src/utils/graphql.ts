export type ConnectionType<ITEM> = {
  readonly edges?: ReadonlyArray<{
    readonly node?: ITEM | null;
  } | null>;
} | null;

export const mapConnection = <ITEM, RETURN>(
  callback: (item: ITEM) => RETURN,
  query?: ConnectionType<ITEM>
): RETURN[] => {
  const existingNodes: RETURN[] = [];
  const edges = query?.edges ?? [];

  for (const edge of edges) {
    if (edge?.node) {
      existingNodes.push(callback(edge.node));
    }
  }

  return existingNodes;
};
