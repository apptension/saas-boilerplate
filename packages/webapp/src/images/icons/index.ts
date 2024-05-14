/// <reference types="vite-plugin-svgr/client" />
import FacebookImg from './facebook.svg?react';
import GoogleImg from './google.svg?react';
import HeaderLogoImg from './headerLogo.svg?react';
import HeaderLogoDarkImg from './headerLogoDark.svg?react';

import { makeIcon } from './makeIcon';

//<-- IMPORT ICON FILE -->

export const FacebookIcon = makeIcon(FacebookImg);
export const GoogleIcon = makeIcon(GoogleImg);
export const HeaderLogoIcon = makeIcon(HeaderLogoImg);
export const HeaderLogoDarkIcon = makeIcon(HeaderLogoDarkImg);
//<-- EXPORT ICON COMPONENT -->
