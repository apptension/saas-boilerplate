/**
 * Jest mock for remark-gfm (ESM-only package)
 * Returns a no-op plugin function
 */
const remarkGfm = () => {
  return (tree: unknown) => tree;
};

export default remarkGfm;
