import { omit } from 'ramda';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom';

import { cn } from '../../../lib/utils';
import { buttonVariants } from '../../ui/button';
import { ButtonBaseProps, ButtonVariant } from '../button';
import { renderIcon } from '../button/button.utils';
import { isInternalLink, isInternalNavLink } from './link.utils';

export type LinkNavLinkExtension = { navLink?: boolean; children?: ReactNode };
export type InternalLinkProps = RouterLinkProps & ButtonBaseProps & LinkNavLinkExtension;
export type InternalNavLinkProps = RouterNavLinkProps & ButtonBaseProps & LinkNavLinkExtension;
export type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonBaseProps & LinkNavLinkExtension;

export type LinkProps = InternalLinkProps | InternalNavLinkProps | ExternalLinkProps;

export const Link = (props: LinkProps) => {
  const { variant = ButtonVariant.LINK, children, icon, className, ...linkProps } = props;

  const renderInternalLink = (props: Omit<InternalLinkProps, 'children'> | Omit<InternalNavLinkProps, 'children'>) =>
    isInternalNavLink(props) ? (
      <RouterNavLink className={className} {...omit(['navLink'], props)}>
        {renderIcon({ icon })}
        {children}
      </RouterNavLink>
    ) : (
      <RouterLink className={cn(buttonVariants({ variant, className }), className)} {...(props as InternalLinkProps)}>
        {renderIcon({ icon })}
        {children}
      </RouterLink>
    );

  const renderExternalLink = (props: ExternalLinkProps) => (
    <a className={cn(buttonVariants({ variant, className }), className)} {...props}>
      {renderIcon({ icon })}
      {children}
    </a>
  );

  return isInternalLink(linkProps) ? renderInternalLink(linkProps) : renderExternalLink(linkProps as ExternalLinkProps);
};
