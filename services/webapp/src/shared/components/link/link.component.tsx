import React, { AnchorHTMLAttributes, ReactNode } from 'react';
import { LinkProps as RouterLinkProps, NavLinkProps as RouterNavLinkProps } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { omit } from 'ramda';
import { ButtonTheme, ButtonVariant } from '../button/button.types';
import { Icon } from '../button/button.styles';
import { RouterLinkContainer, HtmlLinkContainer, RouterNavLinkContainer } from './link.styles';

type BaseProps = {
  variant?: ButtonVariant;
  icon?: ReactNode;
  navLink?: boolean;
};

type InternalLinkProps = RouterLinkProps & BaseProps;
type InternalNavLinkProps = RouterNavLinkProps & BaseProps;
type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & BaseProps;

export type LinkProps = InternalLinkProps | InternalNavLinkProps | ExternalLinkProps;

const isInternalLink = (props: LinkProps): props is InternalLinkProps => {
  // @ts-ignore
  return !!props.to;
};

const isInternalNavLink = (props: LinkProps): props is InternalLinkProps => {
  return isInternalLink(props) && !!props.navLink;
};

export const Link = (props: LinkProps) => {
  const { children, variant = ButtonVariant.RAW, icon, ...linkProps } = props;
  const theme: ButtonTheme = { variant, isDisabled: false };
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
      <RouterLinkContainer {...props}>{content}</RouterLinkContainer>
    );

  const renderExternalLink = (props: ExternalLinkProps) => <HtmlLinkContainer {...props}>{content}</HtmlLinkContainer>;

  return (
    <ThemeProvider theme={theme}>
      {isInternalLink(linkProps) ? renderInternalLink(linkProps) : renderExternalLink(linkProps)}
    </ThemeProvider>
  );
};
