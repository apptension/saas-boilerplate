import { ReactNode } from 'react';

import { HiddenText } from './preheader.styles';

export type PreheaderProps = {
  /**
   * Preview text that appears in email client list view
   * Keep under 100 characters for best display
   */
  children: ReactNode;
};

/**
 * Preheader component for email preview text
 * This text is hidden in the email body but visible in email client previews
 */
export const Preheader = ({ children }: PreheaderProps) => {
  return (
    <HiddenText>
      {children}
      {/* Add whitespace to push any footer content out of preview */}
      {'\u00A0\u200C'.repeat(50)}
    </HiddenText>
  );
};
