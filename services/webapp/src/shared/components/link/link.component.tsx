import React, { AnchorHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { LinkProps as RouterLinkProps } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ButtonTheme, ButtonVariant } from '../button/button.types';
import { Icon } from '../button/button.styles';
import { RouterLinkContainer, HtmlLinkContainer } from './link.styles';

type BaseProps = {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

type InternalLinkProps = RouterLinkProps & BaseProps;
type ExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & BaseProps;

export type LinkProps = InternalLinkProps | ExternalLinkProps;

const isInternalLink = (props: LinkProps): props is InternalLinkProps => {
  // @ts-ignore
  return !!props.to;
};

export const Link = ({ children, variant = ButtonVariant.RAW, icon, ...props }: LinkProps) => {
  const theme: ButtonTheme = { variant, isDisabled: false };

  const content = (
    <>
      {icon ? <Icon>{icon}</Icon> : null}
      {children}
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      {isInternalLink(props) ? (
        <RouterLinkContainer {...props}>{content}</RouterLinkContainer>
      ) : (
        <HtmlLinkContainer {...props}>{content}</HtmlLinkContainer>
      )}
    </ThemeProvider>
  );
};
