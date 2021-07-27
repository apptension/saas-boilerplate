import styled from 'styled-components';
import backIcon from '@iconify-icons/ion/chevron-back';
import { ComponentProps } from 'react';
import { Icon } from '../icon';
import { sizeUnits } from '../../../theme/size';
import { Link } from '../link';
import { ButtonVariant } from '../forms/button';

const BackIcon = styled(Icon).attrs(() => ({ icon: backIcon }))`
  font-size: ${sizeUnits(2)};
`;

export const Container = styled(Link).attrs(() => ({ icon: <BackIcon />, variant: ButtonVariant.RAW }))<
  ComponentProps<typeof Link>
>`
  margin-bottom: ${sizeUnits(2)};
`;
