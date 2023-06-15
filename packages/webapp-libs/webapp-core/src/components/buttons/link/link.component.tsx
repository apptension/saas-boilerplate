import { omit } from 'ramda';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
  NavLink as RouterNavLink,
  NavLinkProps as RouterNavLinkProps,
} from 'react-router-dom';

import { ButtonBaseProps, ButtonVariant } from '../button';
import { buttonVariants } from '../button/button.styles';
import { ButtonSize } from '../button/button.types';
import { renderIcon } from '../button/button.utils';
import { isInternalLink, isInternalNavLink } from './link.utils';
import { cn } from '@sb/webapp-core/lib/utils';

export type LinkNavLinkExtension = { navLink?: boolean; children?: ReactNode };
export type InternalLinkProps = RouterLinkProps & ButtonBaseProps & LinkNavLinkExtension;
export type InternalNavLinkProps = RouterNavLinkProps & ButtonBaseProps & LinkNavLinkExtension;
export type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonBaseProps & LinkNavLinkExtension;

export type LinkProps = InternalLinkProps | InternalNavLinkProps | ExternalLinkProps;

export const Link = (props: LinkProps) => {
  const { variant = ButtonVariant.LINK, size = ButtonSize.NORMAL, children, icon, className, ...linkProps } = props;

  const renderInternalLink = (props: Omit<InternalLinkProps, 'children'> | Omit<InternalNavLinkProps, 'children'>) =>
    isInternalNavLink(props) ? (
      <RouterNavLink className={className} {...omit(['navLink'], props)}>
        {renderIcon({ icon })}
        {children}
      </RouterNavLink>
    ) : (
      <RouterLink className={cn(buttonVariants({ variant, className }))} {...(props as InternalLinkProps)}>
        {renderIcon({ icon })}
        {children}
      </RouterLink>
    );

  const renderExternalLink = (props: ExternalLinkProps) => (
    <a className={cn(buttonVariants({ variant, className }))} {...props}>
      {renderIcon({ icon })}
      {children}
    </a>
  );

  return isInternalLink(linkProps) ? renderInternalLink(linkProps) : renderExternalLink(linkProps as ExternalLinkProps);
};
