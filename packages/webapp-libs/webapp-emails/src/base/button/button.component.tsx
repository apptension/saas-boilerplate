import { ENV } from '@sb/webapp-core/config/env';
import { HTMLAttributes } from 'react';

import { Container } from './button.styles';

export type ButtonProps = HTMLAttributes<HTMLAnchorElement> & {
  linkTo: string;
};

export const Button = ({ linkTo, children, ...restProps }: ButtonProps) => {
  const isExternalLink = linkTo.startsWith('http');
  const hrefUrl = isExternalLink ? linkTo : `${ENV.PUBLIC_URL}${linkTo}`;

  return (
    <Container {...restProps} href={hrefUrl}>
      {children}
    </Container>
  );
};
