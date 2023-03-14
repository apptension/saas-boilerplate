import { color, media, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div`
  text-align: center;
  padding-top: ${size.sizeUnits(3)};
  padding-bottom: ${size.sizeUnits(3)};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  ${size.contentWrapper};
  ${size.contentWithLimitedWidth};
  margin-left: 0;

  ${media.media(media.Breakpoint.TABLET)`
    align-items: flex-start;
  `};
`;

export const Header = styled.h1`
  ${typography.heading3};
  margin-bottom: ${size.sizeUnits(3)};
  display: none;

  ${media.media(media.Breakpoint.TABLET)`
    display: block;
  `};
`;

export const HeaderInfo = styled.div`
  display: grid;
  grid-template-areas:
    'avatar'
    'avatarError'
    'email'
    'roles';
  grid-column-gap: ${size.sizeUnits(3)};

  ${media.media(media.Breakpoint.TABLET)`
    width: 100%;
    grid-template-columns: auto 1fr;
    grid-row-gap: ${size.sizeUnits(1)};
    grid-template-areas:
      'avatar email'
      'avatar roles'
      'avatarError avatarError';
  `};
`;

export const EmailLabel = styled(typography.ParagraphBold)`
  grid-area: email;
  color: ${color.greyScale.get(15)};
  white-space: pre-wrap;
  ${media.media(media.Breakpoint.TABLET)`
    text-align: left;
    display: flex;
    align-items: flex-end;
  `};
`;

export const RolesLabel = styled(typography.Paragraph)`
  grid-area: roles;
  color: ${color.greyScale.get(45)};
  white-space: pre-wrap;
  ${media.media(media.Breakpoint.TABLET)`
    text-align: left;
  `};
`;

export const FormHeader = styled(typography.H4).attrs(() => ({ as: 'h1' }))`
  margin-top: ${size.sizeUnits(6)};
  margin-bottom: ${size.sizeUnits(3)};
  text-align: left;
  ${size.formFieldWidth};

  ${media.media(media.Breakpoint.TABLET)`
    max-width: none;
  `};
`;
