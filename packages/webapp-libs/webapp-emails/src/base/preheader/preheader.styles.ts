import styled from 'styled-components';

/**
 * Hidden text that appears in email client preview
 * Uses multiple techniques to hide in email body:
 * - display: none (most clients)
 * - mso-hide: all (Outlook)
 * - font-size: 0 (fallback)
 * - line-height: 0 (fallback)
 * - max-height: 0 (fallback)
 * - overflow: hidden (fallback)
 */
export const HiddenText = styled.div`
  display: none !important;
  font-size: 1px;
  color: #ffffff;
  line-height: 1px;
  max-height: 0px;
  max-width: 0px;
  opacity: 0;
  overflow: hidden;
  mso-hide: all;
`;
