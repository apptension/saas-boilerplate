import styled from 'styled-components';
import { color } from '../../../theme';
import { formFieldWidth, sizeUnits } from '../../../theme/size';
import { Breakpoint, media } from '../../../theme/media';

export const Container = styled.div``;

export const Form = styled.form.attrs(() => ({ noValidate: true }))`
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  ${media(Breakpoint.TABLET)`
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
  ${formFieldWidth};
  ${media(Breakpoint.TABLET)`
    margin-right: ${sizeUnits(3)};
  `};
`;

export const Buttons = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  margin-top: ${sizeUnits(2)};
  ${formFieldWidth};

  & > *:first-child {
    margin-right: ${sizeUnits(1)};
  }

  ${media(Breakpoint.TABLET)`
    margin-top: 0;
    max-width: none;
    width: auto;
  `};
`;
