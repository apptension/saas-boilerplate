import React, { HTMLAttributes } from 'react';
import { Container } from './button.styles';

export interface ButtonProps extends HTMLAttributes<HTMLAnchorElement> {
  linkTo: string;
}

export const Button = (props: ButtonProps) => {
  const isExternalLink = props.linkTo.startsWith('http');
  const hrefUrl = isExternalLink ? props.linkTo : `${process.env.PUBLIC_URL}${props.linkTo}`;
  return (
    <Container {...props} href={hrefUrl}>
      {props.children}
    </Container>
  );
};
