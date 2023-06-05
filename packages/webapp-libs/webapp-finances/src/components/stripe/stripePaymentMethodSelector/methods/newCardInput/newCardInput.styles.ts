import { Input } from '@sb/webapp-core/components/forms';
import { color, fontFamily, fontWeight, media, size, transition, typography } from '@sb/webapp-core/theme';
import styled, { css } from 'styled-components';

const FIELD_HEIGHT = 40;

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
`;

export const StripeIframeStyles = {
  base: {
    color: color.input.text,
    fontFamily: fontFamily.primary,
    fontSmoothing: 'antialiased',
    fontSize: '13px',
    lineHeight: '40px',
    fontWeight: fontWeight.regular,
    '::placeholder': { color: color.input.text },
    border: `1px solid red`,
    padding: '10px',
  },
  invalid: { color: color.input.invalid, iconColor: color.input.invalid },
};

const smallFieldStyle = css`
  width: calc(50% - 8px);
  &:last-child {
    margin-left: ${size.sizeUnits(2)};
  }
`;

const wideFieldStyle = css`
  flex-grow: 1;
`;

export const StripeFieldContainer = styled.label<{ small?: boolean }>`
  width: 100%;
  min-width: ${size.sizeUnits(10)};
  ${(props) => (props.small ? smallFieldStyle : wideFieldStyle)};
  margin-top: ${size.sizeUnits(3)};

  ${media.media(media.Breakpoint.TABLET)`
    width: auto;
    margin-top: 0;
    & + & {
      margin-left: ${size.sizeUnits(2)};
    }
  `};
`;

export const StripeNameField = styled(Input)`
  width: 100%;
  max-width: none;
  margin-bottom: ${size.sizeUnits(3)};
`;

export const StripeFieldElement = styled.div`
  height: ${FIELD_HEIGHT}px;
  color: ${color.input.text};
  border: 1px solid ${color.input.border};
  box-sizing: border-box;
  border-radius: 4px;
  ${typography.label};
  line-height: ${FIELD_HEIGHT}px;
  padding-left: ${size.sizeUnits(1)};
  padding-right: ${size.sizeUnits(1)};
  transition: background-color ${transition.primary}, border-color ${transition.primary}, color ${transition.primary};

  &:focus,
  &:focus-within {
    background-color: red;
  }
`;

export const StripeFieldLabel = styled.p`
  ${typography.label};
  color: ${color.input.label};
  margin-bottom: 4px;

  &:after {
    content: ' *';
    color: ${color.error};
  }
`;

export const ErrorMessage = styled(typography.MicroLabel)`
  margin-top: 2px;
  color: ${color.error};
`;