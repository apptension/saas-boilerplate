import { Button } from '@sb/webapp-core/components/buttons';
import { color, media, size, typography } from '@sb/webapp-core/theme';
import styled from 'styled-components';

export const Container = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${size.sizeUnits(2)};
  border: 1px solid ${(props) => (props.isActive ? color.primary : color.greyScale.get(90))};
  border-radius: 4px;
  width: 100%;
  max-width: 400px;

  ${media.media(media.Breakpoint.TABLET)`
    max-width: 252px;
  `};
`;

export const Content = styled.div``;

export const Name = styled.h3`
  text-align: center;
  margin-bottom: ${size.sizeUnits(2)};
`;

export const FeaturesList = styled.ul`
  list-style: inside;
`;

export const Feature = styled.li`
  ${typography.label};

  & + & {
    margin-top: ${size.sizeUnits(1)};
  }
`;
