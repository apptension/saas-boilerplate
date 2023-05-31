import { Link } from '@sb/webapp-core/components/buttons';
import { Checkbox as CheckboxBase } from '@sb/webapp-core/components/forms';
import { color, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.form.attrs(() => ({ noValidate: true }))`
  ${size.formFieldWidth};

  ${Link} {
    display: inline;
    ${typography.microlabel};
  }
`;

export const ErrorMessage = styled(typography.MicroLabel)`
  position: absolute;
  color: ${color.error};
`;

export const Checkbox = styled(CheckboxBase)`
  margin-top: ${size.sizeUnits(5)};
  white-space: pre-wrap;
`;
