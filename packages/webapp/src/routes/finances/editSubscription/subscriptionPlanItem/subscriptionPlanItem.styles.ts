import styled from 'styled-components';
import { Button } from '../../../../shared/components/forms/button';
import { sizeUnits } from '../../../../theme/size';
import { greyScale, primary } from '../../../../theme/color';
import { Breakpoint, media } from '../../../../theme/media';
import { label } from '../../../../theme/typography';

export const Container = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: ${sizeUnits(2)};
  border: 1px solid ${(props) => (props.isActive ? primary : greyScale.get(90))};
  border-radius: 4px;
  width: 100%;
  max-width: 400px;

  ${media(Breakpoint.TABLET)`
    max-width: 252px;
  `};
`;

export const Content = styled.div``;

export const Name = styled.h3`
  text-align: center;
  margin-bottom: ${sizeUnits(2)};
`;

export const SelectButton = styled(Button)`
  margin-top: ${sizeUnits(4)};
  width: 100%;
`;

export const FeaturesList = styled.ul`
  list-style: inside;
`;

export const Feature = styled.li`
  ${label};

  & + & {
    margin-top: ${sizeUnits(1)};
  }
`;
