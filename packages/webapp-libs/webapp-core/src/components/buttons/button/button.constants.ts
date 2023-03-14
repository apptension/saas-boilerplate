import { color } from '../../../theme';
import { colorScale } from '../../../theme/utils/colorScale';
import { ButtonColor } from './button.types';

export const COLOR_SCALES_RECORD: Record<ButtonColor, ReturnType<typeof colorScale>> = {
  [ButtonColor.PRIMARY]: color.skyBlueScale,
};
