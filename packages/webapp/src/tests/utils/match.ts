// using `screen.getByText(matchTextContent('hello world'))` will match <div>hello <span>world</span></div>
export const matchTextContent = (text: string | RegExp) => (_: unknown, node: Element | null | undefined) => {
  const hasText = (node: Element) => {
    const isPlainString = typeof text === 'string';
    const nodeContent = node.textContent ?? '';
    return isPlainString ? nodeContent === text : new RegExp(text).test(nodeContent);
  };
  const childrenDontHaveText = Array.from(node?.children ?? []).every((child) => !hasText(child));
  return Boolean(node && hasText(node) && childrenDontHaveText);
};
