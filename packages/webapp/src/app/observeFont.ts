import FontFaceObserver from 'fontfaceobserver';
import { fontFamily } from '../theme';

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
