import { colorScale } from '../colorScale';

describe('theme/utils/colorScale', () => {
  it('should return proper derived color for grey scheme', () => {
    const greyScale = colorScale('#808080');

    expect(greyScale.get(5)).toEqual('#0D0D0D');
    expect(greyScale.get(30)).toEqual('#4D4D4D');
    expect(greyScale.get(40)).toEqual('#666666');

    expect(greyScale.get(50)).toEqual('#808080');

    expect(greyScale.get(75)).toEqual('#BFBFBF');
    expect(greyScale.get(95)).toEqual('#F2F2F2');
    expect(greyScale.get(99)).toEqual('#FCFCFC');
  });

  it('should return proper derived color for blue scheme', () => {
    const greyScale = colorScale('#406ABF');

    expect(greyScale.get(5)).toEqual('#060B13');
    expect(greyScale.get(30)).toEqual('#264073');
    expect(greyScale.get(40)).toEqual('#335599');

    expect(greyScale.get(50)).toEqual('#406ABF');

    expect(greyScale.get(75)).toEqual('#A0B5DF');
    expect(greyScale.get(95)).toEqual('#ECF0F9');
    expect(greyScale.get(99)).toEqual('#FBFCFE');
  });
});
