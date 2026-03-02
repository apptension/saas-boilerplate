import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Container,
  FooterTable,
  FooterTd,
  FooterTr,
  LegalText,
  LinkSeparator,
  SocialLink,
  SocialLinksContainer,
  TextLink,
} from './footer.styles';

export type SocialLinks = {
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
};

export type FooterProps = {
  /** Company name for copyright */
  companyName?: string;
  /** Company address line */
  address?: ReactNode;
  /** Social media links */
  socialLinks?: SocialLinks;
  /** Unsubscribe URL */
  unsubscribeUrl?: string;
  /** Privacy policy URL */
  privacyUrl?: string;
  /** Terms of service URL */
  termsUrl?: string;
  /** Additional footer content */
  children?: ReactNode;
};

const currentYear = new Date().getFullYear();

/**
 * Email footer component with social links, legal text, and unsubscribe
 */
export const Footer = ({
  companyName = 'Your Company',
  address,
  socialLinks,
  unsubscribeUrl,
  privacyUrl,
  termsUrl,
  children,
}: FooterProps) => {
  const hasSocialLinks = socialLinks && Object.values(socialLinks).some(Boolean);

  return (
    <Container>
      <FooterTable>
        <tbody>
          {/* Social Links */}
          {hasSocialLinks && (
            <FooterTr>
              <FooterTd>
                <SocialLinksContainer>
                  {socialLinks?.twitter && (
                    <SocialLink href={socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                      Twitter
                    </SocialLink>
                  )}
                  {socialLinks?.facebook && (
                    <SocialLink href={socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                      Facebook
                    </SocialLink>
                  )}
                  {socialLinks?.linkedin && (
                    <SocialLink href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </SocialLink>
                  )}
                  {socialLinks?.instagram && (
                    <SocialLink href={socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                      Instagram
                    </SocialLink>
                  )}
                  {socialLinks?.github && (
                    <SocialLink href={socialLinks.github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </SocialLink>
                  )}
                </SocialLinksContainer>
              </FooterTd>
            </FooterTr>
          )}

          {/* Additional content */}
          {children && (
            <FooterTr>
              <FooterTd>{children}</FooterTd>
            </FooterTr>
          )}

          {/* Company info */}
          <FooterTr>
            <FooterTd>
              <LegalText>
                © {currentYear} {companyName}.{' '}
                <FormattedMessage defaultMessage="All rights reserved." id="Email / Footer / Rights reserved" />
              </LegalText>
              {address && <LegalText>{address}</LegalText>}
            </FooterTd>
          </FooterTr>

          {/* Legal links */}
          {(unsubscribeUrl || privacyUrl || termsUrl) && (
            <FooterTr>
              <FooterTd>
                <LegalText>
                  {unsubscribeUrl && (
                    <TextLink href={unsubscribeUrl}>
                      <FormattedMessage defaultMessage="Unsubscribe" id="Email / Footer / Unsubscribe" />
                    </TextLink>
                  )}
                  {unsubscribeUrl && privacyUrl && <LinkSeparator>|</LinkSeparator>}
                  {privacyUrl && (
                    <TextLink href={privacyUrl}>
                      <FormattedMessage defaultMessage="Privacy Policy" id="Email / Footer / Privacy" />
                    </TextLink>
                  )}
                  {privacyUrl && termsUrl && <LinkSeparator>|</LinkSeparator>}
                  {termsUrl && (
                    <TextLink href={termsUrl}>
                      <FormattedMessage defaultMessage="Terms of Service" id="Email / Footer / Terms" />
                    </TextLink>
                  )}
                </LegalText>
              </FooterTd>
            </FooterTr>
          )}
        </tbody>
      </FooterTable>
    </Container>
  );
};
