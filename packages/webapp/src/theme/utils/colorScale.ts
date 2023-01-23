import color from 'color';

// prettier-ignore
const scaleLevels = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 96, 97, 98, 99] as const;
export type ColorScaleIndex = typeof scaleLevels[number];

export const colorScale = (baseColorString: string) => {
  const baseColor = color(baseColorString);
  const scale = scaleLevels.map((level) => baseColor.lightness(level).hex());

  return {
    get: (level: ColorScaleIndex = 50) => scale[scaleLevels.indexOf(level)],
    base: baseColorString,
  };
};
