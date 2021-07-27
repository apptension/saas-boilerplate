import styled from 'styled-components';
import { ComponentProps } from 'react';
import { microlabel, MicroLabel } from '../../../../theme/typography';
import { color } from '../../../../theme';
import { Button } from '../../forms/button';
import { formFieldWidth, sizeUnits } from '../../../../theme/size';
import { Checkbox as CheckboxBase } from '../../forms/checkbox';
import { Link } from '../../link';

export const Container = styled.form.attrs(() => ({ noValidate: true }))`
  ${formFieldWidth};
`;

export const ErrorMessage = styled(MicroLabel)`
  position: absolute;
  color: ${color.error};
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit', fixedWidth: true }))`
  margin-top: ${sizeUnits(5)};
`;

export const Checkbox = styled(CheckboxBase)`
  margin-top: ${sizeUnits(5)};
  white-space: pre-wrap;
`;

export const InlineLink = styled(Link)<ComponentProps<typeof Link>>`
  display: inline;
  ${microlabel};
`;
