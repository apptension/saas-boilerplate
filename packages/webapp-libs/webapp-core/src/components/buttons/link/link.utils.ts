import { InternalLinkProps, LinkProps } from './link.component';

export const isInternalLink = (props: LinkProps): props is InternalLinkProps => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return !!props.to;
};
export const isInternalNavLink = (props: LinkProps): props is InternalLinkProps => {
  return isInternalLink(props) && !!props.navLink;
};
