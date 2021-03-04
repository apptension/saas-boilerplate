import styled from 'styled-components';
import { Avatar as AvatarBase } from '../../shared/components/avatar';
import { contentWithLimitedWidth, contentWrapper, formFieldWidth, sizeUnits } from '../../theme/size';
import { H4, heading3, Paragraph, ParagraphBold } from '../../theme/typography';
import { greyScale } from '../../theme/color';
import { Breakpoint, media } from '../../theme/media';

export const Container = styled.div`
  text-align: center;
  padding-top: ${sizeUnits(3)};
  padding-bottom: ${sizeUnits(3)};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  ${contentWrapper};
  ${contentWithLimitedWidth};
  margin-left: 0;
`;

export const Header = styled.h1`
  ${heading3};
  margin-bottom: ${sizeUnits(3)};
  display: none;

  ${media(Breakpoint.TABLET)`
    display: block;
  `};
`;

export const HeaderInfo = styled.div`
  display: grid;
  grid-template-areas:
    'avatar'
    'email'
    'roles';
  grid-column-gap: ${sizeUnits(3)};

  ${media(Breakpoint.TABLET)`
    width: 100%;
    grid-template-columns: auto 1fr;
    grid-row-gap: ${sizeUnits(1)};
    grid-template-areas:
      'avatar email'
      'avatar roles';
  `};
`;

export const Avatar = styled(AvatarBase).attrs(() => ({ size: 80 }))`
  margin-bottom: ${sizeUnits(2)};
  grid-area: avatar;
  justify-self: center;

  ${media(Breakpoint.TABLET)`
    margin-bottom: 0;
  `};
`;

export const EmailLabel = styled(ParagraphBold)`
  grid-area: email;
  color: ${greyScale.get(15)};
  white-space: pre-wrap;
  ${media(Breakpoint.TABLET)`
    text-align: left;
    display: flex;
    align-items: flex-end;
  `};
`;

export const RolesLabel = styled(Paragraph)`
  grid-area: roles;
  color: ${greyScale.get(45)};
  white-space: pre-wrap;
  ${media(Breakpoint.TABLET)`
    text-align: left;
  `};
`;

export const FormHeader = styled(H4).attrs(() => ({ as: 'h1' }))`
  margin-top: ${sizeUnits(6)};
  margin-bottom: ${sizeUnits(3)};
  text-align: left;
  ${formFieldWidth};

  ${media(Breakpoint.TABLET)`
    max-width: none;
  `};
`;
