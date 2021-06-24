import { colorScale } from './utils/colorScale';

export const white = '#ffffff';
export const black = '#000000';

export const greyScale = colorScale('#808080');
export const skyBlueScale = colorScale('#0080FF');
export const ultramarineBlueScale = colorScale('#0001FF');
export const prussianBlueScale = colorScale('#406ABF');
export const cherryRedScale = colorScale('#FF0055');

export const text = greyScale.get(15);
export const border = '#80809B';
export const disabled = '#DDDDE0';
export const primary = skyBlueScale.get(50);
export const secondary = '#2249f9';
export const error = cherryRedScale.get(50);

export const button = {
  main: skyBlueScale.get(50),
  text: white,
};

export const checkbox = {
  idle: greyScale.get(55),
  icon: white,
  main: skyBlueScale.get(35),
  active: skyBlueScale.get(50),
  hover: skyBlueScale.get(65),
  invalid: error,
};

export const input = {
  text: greyScale.get(15),
  label: greyScale.get(15),
  border: greyScale.get(55),
  background: white,

  disabled: {
    text: greyScale.get(70),
    label: greyScale.get(40),
    border: greyScale.get(90),
    background: greyScale.get(98),
  },

  hover: skyBlueScale.get(65),
  active: skyBlueScale.get(50),
  invalid: cherryRedScale.get(50),
};

export const radio = {
  main: skyBlueScale.get(50),
  hover: {
    main: skyBlueScale.get(98),
    border: skyBlueScale.get(65),
  },
  disabled: {
    main: greyScale.get(90),
    text: greyScale.get(70),
  },
};

export const listItem = {
  background: white,
  hover: {
    background: skyBlueScale.get(98),
  },
  focus: {
    background: skyBlueScale.get(98),
  },
  active: {
    background: skyBlueScale.get(95),
    text: skyBlueScale.get(35),
  },
};
