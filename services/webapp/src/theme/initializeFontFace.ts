// @ts-ignore
import interPrimary from '../fonts/Inter-Regular.woff';
// @ts-ignore
import interBold from '../fonts/Inter-SemiBold.woff';
import { interFontName } from './font';

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
