import { UnsupportedBrowserDetection } from '../unsupportedBrowserDetection';

/* eslint-disable max-len*/
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36';
const IE_UA = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
const SAFARI_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15';
const OPERA_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.182 Safari/537.36 OPR/74.0.3911.107';
const CRAWLER_UA = 'Googlebot/2.1';
const FB_UA =
  'Mozilla/5.0 (Linux; Android 4.4.4; One Build/KTU84L.H4) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/33.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/28.0.0.20.16;]';
const HEADLESS_CHROME_UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.79 Safari/537.36';
/* eslint-enable max-len*/

function setUserAgent(userAgent: string) {
  // @ts-ignore
  navigator.__defineGetter__('userAgent', () => userAgent);
}

describe('Utils: UnsupportedBrowserDetection Class', () => {
  const checkSupport = ({ isInAppBrowserSupported }: { isInAppBrowserSupported?: boolean }) =>
    new UnsupportedBrowserDetection(undefined, isInAppBrowserSupported);

  beforeEach(() => {
    document.documentElement.className = '';
  });

  describe('isSupported()', () => {
    it('should return true for Chrome', () => {
      setUserAgent(CHROME_UA);
      const detector = checkSupport({});
      expect(detector.isSupported()).toBe(true);
    });

    it('should return true for Headless Chrome', () => {
      setUserAgent(HEADLESS_CHROME_UA);
      const detector = checkSupport({});
      expect(detector.isSupported()).toBe(true);
    });

    it('should return true for Opera', () => {
      setUserAgent(OPERA_UA);
      const detector = checkSupport({});
      expect(detector.isSupported()).toBe(true);
    });

    it('should return true for Safari', () => {
      setUserAgent(SAFARI_UA);
      const detector = checkSupport({});
      expect(detector.isSupported()).toBe(true);
    });

    it('should return false for IE', () => {
      setUserAgent(IE_UA);
      const detector = checkSupport({});
      expect(detector.isSupported()).toBe(false);
    });

    it('should return true when is in-app browser and isInAppBrowserSupported equals true', () => {
      setUserAgent(FB_UA);

      const detector = checkSupport({ isInAppBrowserSupported: true });

      expect(detector.isSupported()).toBe(true);
    });

    it('should return false when is in-app browser and isInAppBrowserSupported equals false', () => {
      setUserAgent(FB_UA);

      const detector = checkSupport({ isInAppBrowserSupported: false });

      expect(detector.isSupported()).toBe(false);
    });

    it('should return true for crawler bots', () => {
      setUserAgent(CRAWLER_UA);
      const detector = checkSupport({});
      expect(detector.isSupported()).toBe(true);
    });
  });
});
