import 'styled-components';

import { media } from '../theme';

declare module 'styled-components' {
  export interface DefaultTheme {
    activeBreakpoint?: media.Breakpoint;
  }
}
