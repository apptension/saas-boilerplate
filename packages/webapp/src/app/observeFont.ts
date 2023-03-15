import { fontFamily } from '@sb/webapp-core/theme';
import FontFaceObserver from 'fontfaceobserver';

export const observeFont = () => {
  // When font is loaded, add a font-family to the body
  new FontFaceObserver(fontFamily.primary, {}).load().then(
    () => {
      document.body.classList.add('fontLoaded');
    },
    () => {
      document.body.classList.remove('fontLoaded');
    }
  );
};
