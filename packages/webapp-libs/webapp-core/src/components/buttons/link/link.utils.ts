import { InternalLinkProps, LinkProps } from './link.component';

export const isInternalLink = (props: Omit<LinkProps, 'children'>): props is InternalLinkProps => {
  // @ts-ignore
  return !!props.to;
};
export const isInternalNavLink = (props: Omit<LinkProps, 'children'>): props is InternalLinkProps => {
  return isInternalLink(props) && !!props.navLink;
};
