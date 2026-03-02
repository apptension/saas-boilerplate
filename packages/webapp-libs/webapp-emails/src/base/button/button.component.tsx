import { ENV } from '@sb/webapp-core/config/env';
import { HTMLAttributes, ReactNode } from 'react';

import {
  ButtonLink,
  ButtonTableCell,
  ButtonTableWrapper,
  InlineButtonLink,
  InlineOutlineButtonLink,
  InlineSecondaryButtonLink,
  OutlineButtonLink,
  SecondaryButtonLink,
} from './button.styles';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export type ButtonProps = Omit<HTMLAttributes<HTMLAnchorElement>, 'children'> & {
  /** URL to link to */
  linkTo: string;
  /** Button style variant */
  variant?: ButtonVariant;
  /** Full width button */
  fullWidth?: boolean;
  /** Inline mode - renders without table wrapper, for use inside data tables */
  inline?: boolean;
  /** Button content */
  children: ReactNode;
};

const buttonComponents = {
  primary: ButtonLink,
  secondary: SecondaryButtonLink,
  outline: OutlineButtonLink,
};

const inlineButtonComponents = {
  primary: InlineButtonLink,
  secondary: InlineSecondaryButtonLink,
  outline: InlineOutlineButtonLink,
};

/**
 * Email-safe bulletproof button component
 * Uses table-based layout for maximum email client compatibility
 * Use inline={true} when placing inside data tables
 */
export const Button = ({
  linkTo,
  variant = 'primary',
  fullWidth = false,
  inline = false,
  children,
  ...rest
}: ButtonProps) => {
  const isExternalLink = linkTo.startsWith('http');
  const hrefUrl = isExternalLink ? linkTo : `${ENV.PUBLIC_URL}${linkTo}`;

  // Inline mode - simple link without table wrapper
  if (inline) {
    const InlineLinkComponent = inlineButtonComponents[variant];
    return (
      <InlineLinkComponent {...rest} href={hrefUrl} target={isExternalLink ? '_blank' : undefined}>
        {children}
      </InlineLinkComponent>
    );
  }

  // Standard mode - bulletproof table-based button
  const LinkComponent = buttonComponents[variant];
  return (
    <ButtonTableWrapper $fullWidth={fullWidth}>
      <tbody>
        <tr>
          <ButtonTableCell $variant={variant}>
            <LinkComponent {...rest} href={hrefUrl} target={isExternalLink ? '_blank' : undefined}>
              {children}
            </LinkComponent>
          </ButtonTableCell>
        </tr>
      </tbody>
    </ButtonTableWrapper>
  );
};
