import { media } from '@sb/webapp-core/theme';
import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    activeBreakpoint?: media.Breakpoint;
  }
}
