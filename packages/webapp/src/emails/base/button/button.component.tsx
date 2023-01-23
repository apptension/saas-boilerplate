import { HTMLAttributes } from 'react';
import { ENV } from '../../../app/config/env';
import { Container } from './button.styles';

export type ButtonProps = HTMLAttributes<HTMLAnchorElement> & {
  linkTo: string;
};

export const Button = (props: ButtonProps) => {
  const isExternalLink = props.linkTo.startsWith('http');
  const hrefUrl = isExternalLink ? props.linkTo : `${ENV.PUBLIC_URL}${props.linkTo}`;
  return (
    <Container {...props} href={hrefUrl}>
      {props.children}
    </Container>
  );
};
