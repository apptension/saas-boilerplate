import { colorScale } from './utils/colorScale';

export const white = '#ffffff';

export const greyScale = colorScale('#808080');
export const skyBlueScale = colorScale('#0080FF');
export const cherryRedScale = colorScale('#FF0055');

export const button = {
  main: skyBlueScale.get(50),
  text: white,
};
