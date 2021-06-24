/* eslint-disable import/no-dynamic-require */

// @ts-ignore
import interPrimary from '../fonts/Inter-Regular.woff';
// @ts-ignore
import interBold from '../fonts/Inter-SemiBold.woff';
import { interFontName } from './font';

function fontFace(
  name: string,
  files: { src: string; format: string }[],
  fontWeight = 'normal',
  fontStyle = 'normal'
): string {
  const sources = files.map(({ src, format }, index) => `url(${src}) format("${format}")`).join(',');

  return `
    @font-face{
        font-family: "${name}";
        src: ${sources};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
    }
  `;
}
/* eslint-enable import/no-dynamic-require */

const generateFontsString = (): string =>
  [
    fontFace(interFontName, [{ src: interPrimary, format: 'woff' }]),
    fontFace(interFontName, [{ src: interBold, format: 'woff' }], '600'),
  ].join('\n');

export default (): void => {
  const style = document.createElement('style');
  style.innerHTML = generateFontsString();
  document.head.appendChild(style);
};
