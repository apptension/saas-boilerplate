import { ReactNode } from 'react';

import { Footer, FooterProps } from '../footer';
import { Image } from '../image';
import { Preheader } from '../preheader';
import {
  BodyContent,
  Container,
  ContentCell,
  HeaderSection,
  LogoContainer,
  MainTable,
  OuterWrapper,
  Tagline,
} from './layout.styles';

export type LayoutProps = {
  /** Email title/heading */
  title: ReactNode;
  /** Main body text */
  text: ReactNode;
  /** Preview text shown in email client list (keep under 100 chars) */
  preheader?: string;
  /** Optional tagline under logo */
  tagline?: ReactNode;
  /** Logo image filename (from EMAIL_ASSETS_URL) */
  logoSrc?: string;
  /** Logo width in pixels */
  logoWidth?: number;
  /** Footer configuration */
  footer?: FooterProps;
  /** Hide footer completely */
  hideFooter?: boolean;
  /** CTA button or additional content */
  children?: ReactNode;
};

/**
 * Main email layout component with header, body, and footer sections
 */
export const Layout = ({
  title,
  text,
  preheader,
  tagline,
  logoSrc = 'logo.png',
  logoWidth = 180,
  footer,
  hideFooter = false,
  children,
}: LayoutProps) => {
  return (
    <OuterWrapper>
      {/* Hidden preheader text for email client preview */}
      {preheader && <Preheader>{preheader}</Preheader>}

      <Container>
        <MainTable role="presentation">
          <tbody>
            {/* Header with Logo */}
            <tr>
              <HeaderSection>
                <LogoContainer>
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    style={{
                      display: 'block',
                      margin: '0 auto',
                      width: logoWidth,
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </LogoContainer>
                {tagline && <Tagline>{tagline}</Tagline>}
              </HeaderSection>
            </tr>

            {/* Main Content */}
            <tr>
              <ContentCell>
                <BodyContent>
                  {/* Title */}
                  <h1
                    style={{
                      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontSize: '28px',
                      fontWeight: 700,
                      lineHeight: '1.25',
                      color: '#0F172A',
                      margin: '0 0 16px 0',
                      textAlign: 'center',
                    }}
                  >
                    {title}
                  </h1>

                  {/* Body Text */}
                  <p
                    style={{
                      fontFamily: "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif",
                      fontSize: '16px',
                      fontWeight: 400,
                      lineHeight: '1.5',
                      color: '#64748B',
                      margin: '0 0 24px 0',
                      textAlign: 'center',
                    }}
                  >
                    {text}
                  </p>

                  {/* CTA / Children */}
                  {children}
                </BodyContent>
              </ContentCell>
            </tr>
          </tbody>
        </MainTable>

        {/* Footer */}
        {!hideFooter && <Footer {...footer} />}
      </Container>
    </OuterWrapper>
  );
};
