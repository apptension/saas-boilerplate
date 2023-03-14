import { Button, Link } from '@saas-boilerplate-app/webapp-core/components/buttons';
import { Checkbox as CheckboxBase } from '@saas-boilerplate-app/webapp-core/components/forms';
import { color, size, typography } from '@saas-boilerplate-app/webapp-core/theme';
import { ComponentProps } from 'react';
import styled from 'styled-components';

export const Container = styled.form.attrs(() => ({ noValidate: true }))`
  ${size.formFieldWidth};
`;

export const ErrorMessage = styled(typography.MicroLabel)`
  position: absolute;
  color: ${color.error};
`;

export const SubmitButton = styled(Button).attrs(() => ({ type: 'submit', fixedWidth: true }))`
  margin-top: ${size.sizeUnits(5)};
`;

export const Checkbox = styled(CheckboxBase)`
  margin-top: ${size.sizeUnits(5)};
  white-space: pre-wrap;
`;

export const InlineLink = styled(Link)<ComponentProps<typeof Link>>`
  display: inline;
  ${typography.microlabel};
`;
