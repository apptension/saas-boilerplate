// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { interFontName } from '@sb/webapp-core/theme/font';

import interPrimary from '../../assets/fonts/Inter-Regular.woff';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import interBold from '../../assets/fonts/Inter-SemiBold.woff';

const fontFace = (
  name: string,
  files: { src: string; format: string }[],
  fontWeight = 'normal',
  fontStyle = 'normal'
) => {
  const sources = files.map(({ src, format }) => `url(${src}) format("${format}")`).join(',');

  return `
    @font-face{
        font-family: "${name}";
        src: ${sources};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
    }
  `;
};

const generateFontsString = () =>
  [
    fontFace(interFontName, [{ src: interPrimary, format: 'woff' }]),
    fontFace(interFontName, [{ src: interBold, format: 'woff' }], '600'),
  ].join('\n');

export const initializeFontFace = () => {
  const style = document.createElement('style');
  style.innerHTML = generateFontsString();
  document.head.appendChild(style);
};
