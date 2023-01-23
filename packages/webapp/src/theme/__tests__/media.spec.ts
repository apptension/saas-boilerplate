import { Breakpoint, media, responsiveValue } from '../media';

describe('theme/media', () => {
  describe('responsiveValue', () => {
    const getValue = responsiveValue(100, { [Breakpoint.DESKTOP]: 200 });

    describe('when no breakpoint matches', () => {
      it('should return default value', () => {
        const val = getValue({ theme: { activeBreakpoint: Breakpoint.TABLET } });
        expect(val).toBe(100);
      });
    });

    describe('when specified breakpoint matches', () => {
      it('should return provided breakpoint value', () => {
        const val = getValue({ theme: { activeBreakpoint: Breakpoint.DESKTOP } });
        expect(val).toBe(200);
      });
    });

    describe('when lower than specified breakpoint matches', () => {
      it('should return provided breakpoint value', () => {
        const val = getValue({ theme: { activeBreakpoint: Breakpoint.DESKTOP_FULL } });
        expect(val).toBe(200);
      });
    });
  });

  describe('media()', () => {
    const CSS_CONTENT = 'padding: 10px;';
    const getMedia = (...args: Parameters<typeof media>) => media(...args)`${CSS_CONTENT}`.join('');

    describe('for specified breakpoint', () => {
      it('should return correct css media query', () => {
        expect(getMedia(Breakpoint.MOBILE)).toMatchSnapshot();
        expect(getMedia(Breakpoint.TABLET)).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP)).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_WIDE)).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_FULL)).toMatchSnapshot();
      });
    });

    describe('for specified retina breakpoint', () => {
      it('should return correct css media query', () => {
        expect(getMedia(Breakpoint.MOBILE, { retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.TABLET, { retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP, { retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_WIDE, { retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_FULL, { retina: true })).toMatchSnapshot();
      });
    });

    describe('for specified landscape breakpoint', () => {
      it('should return correct css media query', () => {
        expect(getMedia(Breakpoint.MOBILE, { landscape: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.TABLET, { landscape: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP, { landscape: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_WIDE, { landscape: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_FULL, { landscape: true })).toMatchSnapshot();
      });
    });

    describe('for specified retina landscape breakpoint', () => {
      it('should return correct css media query', () => {
        expect(getMedia(Breakpoint.MOBILE, { landscape: true, retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.TABLET, { landscape: true, retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP, { landscape: true, retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_WIDE, { landscape: true, retina: true })).toMatchSnapshot();
        expect(getMedia(Breakpoint.DESKTOP_FULL, { landscape: true, retina: true })).toMatchSnapshot();
      });
    });
  });
});
