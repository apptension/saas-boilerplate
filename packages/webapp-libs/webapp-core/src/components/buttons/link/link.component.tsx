import { omit } from 'ramda';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom';

import { Button, ButtonBaseProps, ButtonVariant } from '../button';
import { ButtonSize } from '../button/button.types';
import { isInternalLink, isInternalNavLink } from './link.utils';

export type LinkNavLinkExtension = { navLink?: boolean; children?: ReactNode };
export type InternalLinkProps = RouterLinkProps & ButtonBaseProps & LinkNavLinkExtension;
export type InternalNavLinkProps = RouterNavLinkProps & ButtonBaseProps & LinkNavLinkExtension;
export type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonBaseProps & LinkNavLinkExtension;

export type LinkProps = InternalLinkProps | InternalNavLinkProps | ExternalLinkProps;

export const Link = (props: LinkProps) => {
  const { variant = ButtonVariant.LINK, size = ButtonSize.NORMAL, children, icon, ...linkProps } = props;

  const renderInternalLink = (props: Omit<InternalLinkProps, 'children'> | Omit<InternalNavLinkProps, 'children'>) =>
    isInternalNavLink(props) ? (
      <RouterNavLink {...omit(['navLink'], props)}>{children}</RouterNavLink>
    ) : (
      <RouterLink {...(props as InternalLinkProps)}>{children}</RouterLink>
    );

  const renderExternalLink = (props: ExternalLinkProps) => <a {...props}>{children}</a>;

  return (
    <Button asChild variant={variant} size={size} icon={icon}>
      {isInternalLink(linkProps) ? renderInternalLink(linkProps) : renderExternalLink(linkProps as ExternalLinkProps)}
    </Button>
  );
};
