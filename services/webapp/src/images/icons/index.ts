import { makeIcon } from './makeIcon';
import { ReactComponent as FacebookImg } from './facebook.svg';
import { ReactComponent as GoogleImg } from './google.svg';
import { ReactComponent as HeaderLogoImg } from './headerLogo.svg';
//<-- IMPORT ICON FILE -->

export const FacebookIcon = makeIcon(FacebookImg);
export const GoogleIcon = makeIcon(GoogleImg);
export const HeaderLogoIcon = makeIcon(HeaderLogoImg);
//<-- EXPORT ICON COMPONENT -->
