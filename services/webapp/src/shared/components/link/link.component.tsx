import { AnchorHTMLAttributes, ReactNode } from 'react';
import { LinkProps as RouterLinkProps, NavLinkProps as RouterNavLinkProps } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { omit } from 'ramda';
import { ButtonTheme, ButtonVariant } from '../forms/button';
import { Icon } from '../forms/button/button.styles';
import { ButtonColor, ButtonSize } from '../forms/button/button.types';
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

export const Link = (props: LinkProps) => {
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
