import { Button as ButtonComponent } from '@react-email/components';
import { ENV } from '@sb/webapp-core/config/env';
import { cn } from '@sb/webapp-core/lib/utils';
import { HTMLAttributes } from 'react';

export type ButtonProps = HTMLAttributes<HTMLAnchorElement> & {
  linkTo: string;
};

export const Button = (props: ButtonProps) => {
  const isExternalLink = props.linkTo.startsWith('http');
  const hrefUrl = isExternalLink ? props.linkTo : `${ENV.PUBLIC_URL}${props.linkTo}`;

  return (
    <ButtonComponent
      href={hrefUrl}
      className={cn('bg-black text-white rounded font-custom text-sm p-2', props.className)}
      data-testid="button-testId"
    >
      {props.children}
    </ButtonComponent>
  );
};
