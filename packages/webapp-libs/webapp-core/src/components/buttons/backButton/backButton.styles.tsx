import backIcon from '@iconify-icons/ion/chevron-back';
import { ComponentProps } from 'react';
import styled from 'styled-components';

import { sizeUnits } from '../../../theme/size';
import { Icon } from '../../icons';
import { ButtonVariant } from '../button';
import { Link } from '../link';

const BackIcon = styled(Icon).attrs(() => ({ icon: backIcon }))`
  font-size: ${sizeUnits(2)};
`;

export const Container = styled(Link).attrs(() => ({
  icon: <BackIcon />,
  variant: ButtonVariant.GHOST,
}))<ComponentProps<typeof Link>>`
  margin-bottom: ${sizeUnits(2)};
`;
