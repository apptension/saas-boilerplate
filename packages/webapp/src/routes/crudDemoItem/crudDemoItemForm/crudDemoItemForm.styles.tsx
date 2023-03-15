import { color, media, size } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div``;

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  ${media.media(media.Breakpoint.TABLET)`
    flex-direction: row;
    align-items: flex-end;
  `};
`;

export const ErrorMessage = styled.p`
  position: absolute;
  color: ${color.error};
`;

export const Fields = styled.div`
  width: 100%;
  ${size.formFieldWidth};
  ${media.media(media.Breakpoint.TABLET)`
    margin-right: ${size.sizeUnits(3)};
  `};
`;

export const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin-top: ${size.sizeUnits(2)};
  ${size.formFieldWidth};

  & > *:first-child {
    margin-right: ${size.sizeUnits(1)};
  }

  ${media.media(media.Breakpoint.TABLET)`
    margin-top: 0;
    max-width: none;
    width: auto;
  `};
`;
