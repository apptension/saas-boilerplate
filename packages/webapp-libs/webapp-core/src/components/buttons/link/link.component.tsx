import { omit } from 'ramda';
import { AnchorHTMLAttributes, ReactNode } from 'react';
import { LinkProps as RouterLinkProps, NavLinkProps as RouterNavLinkProps } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';

import { ButtonTheme, ButtonVariant } from '../button';
import { Icon } from '../button/button.styles';
import { ButtonColor, ButtonSize } from '../button/button.types';
import { HtmlLinkContainer, RouterLinkContainer, RouterNavLinkContainer } from './link.styles';
import { isInternalLink, isInternalNavLink } from './link.utils';

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: ButtonColor;
  icon?: ReactNode;
  navLink?: boolean;
};

export type InternalLinkProps = RouterLinkProps & BaseProps;
export type InternalNavLinkProps = RouterNavLinkProps & BaseProps;
export type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & BaseProps;

export type LinkProps = InternalLinkProps | InternalNavLinkProps | ExternalLinkProps;

const LinkBase = (props: LinkProps) => {
  const {
    children,
    variant = ButtonVariant.RAW,
    size = ButtonSize.NORMAL,
    color = ButtonColor.PRIMARY,
    icon,
    ...linkProps
  } = props;
  const theme: ButtonTheme = { variant, size, color, isDisabled: false };
  const content = (
    <>
      {icon ? <Icon>{icon}</Icon> : null}
      {children}
    </>
  );

  const renderInternalLink = (props: InternalLinkProps | InternalNavLinkProps) =>
    isInternalNavLink(props) ? (
      <RouterNavLinkContainer {...omit(['navLink'], props)}>{content}</RouterNavLinkContainer>
    ) : (
      <RouterLinkContainer {...(props as InternalLinkProps)}>{content}</RouterLinkContainer>
    );

  const renderExternalLink = (props: ExternalLinkProps) => <HtmlLinkContainer {...props}>{content}</HtmlLinkContainer>;

  return (
    <ThemeProvider theme={theme}>
      {isInternalLink(linkProps) ? renderInternalLink(linkProps) : renderExternalLink(linkProps as ExternalLinkProps)}
    </ThemeProvider>
  );
};

export const Link = styled(LinkBase)``;
