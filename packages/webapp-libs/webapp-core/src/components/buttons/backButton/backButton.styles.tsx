import backIcon from '@iconify-icons/ion/chevron-back';
import styled from 'styled-components';

import { sizeUnits } from '../../../theme/size';
import { Icon } from '../../icons';
import { Link } from '../link';

export const BackIcon = styled(Icon).attrs(() => ({ icon: backIcon }))`
  font-size: ${sizeUnits(2)};
`;

export const Container = styled(Link)`
  margin-bottom: ${sizeUnits(2)};
`;
