import 'styled-components';
import { Breakpoint } from './media';

declare module 'styled-components' {
  export interface DefaultTheme {
    activeBreakpoint?: Breakpoint;
  }
}
