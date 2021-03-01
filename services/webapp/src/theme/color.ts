import { colorScale } from './utils/colorScale';

export const white = '#ffffff';
export const black = '#000000';

export const greyScale = colorScale('#808080');
export const skyBlueScale = colorScale('#0080FF');
export const ultramarineBlueScale = colorScale('#0001FF');
export const prussianBlueScale = colorScale('#406ABF');
export const cherryRedScale = colorScale('#FF0055');

export const border = '#80809B';
export const disabled = '#DDDDE0';
export const primary = '#42f272';
export const secondary = '#2249f9';
export const error = cherryRedScale.get(50);

export const button = {
  main: skyBlueScale.get(50),
  inverted: white,

  text: white,
  invertedText: skyBlueScale.get(50),

  hover: skyBlueScale.get(65),
  active: skyBlueScale.get(35),
  outline: skyBlueScale.get(90),

  disabled: {
    main: greyScale.get(90),
    inverted: white,
    text: greyScale.get(70),
  },
  flat: {
    text: greyScale.get(15),
    hover: skyBlueScale.get(98),
    active: skyBlueScale.get(95),
    activeText: skyBlueScale.get(35),
  },
};

export const checkbox = {
  idle: greyScale.get(55),
  icon: white,
  main: skyBlueScale.get(35),
  active: skyBlueScale.get(50),
  hover: skyBlueScale.get(65),
  outline: skyBlueScale.get(90),
  invalid: error,
};
