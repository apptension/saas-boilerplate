import UnsupportedBrowserDetection, { BrowserConfig } from '../unsupportedBrowserDetection';

/* eslint-disable max-len*/
const CHROME_UA =
  'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36';
const IE_UA = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)';
const CRAWLER_UA = 'Googlebot/2.1';
const FB_UA =
  'Mozilla/5.0 (Linux; Android 4.4.4; One Build/KTU84L.H4) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/33.0.0.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/28.0.0.20.16;]';
/* eslint-enable max-len*/

function setUserAgent(userAgent: string) {
  // @ts-ignore
  navigator.__defineGetter__('userAgent', () => userAgent);
}

describe('Utils: UnsupportedBrowserDetection Class', () => {
  const config: BrowserConfig = {
    desktop: [
      {
        browser: 'firefox',
        minversion: 41,
      },
      {
        browser: 'ie',
        versions: [11, 'edge'],
      },
      {
        browser: 'chrome',
        minversion: 45,
      },
      {
        browser: 'edge',
      },
      {
        os: 'mac os',
        minos: '10.10.0',
        browser: 'safari',
        minversion: 8,
      },
    ],
    tablet: [
      {
        os: 'ios',
        minos: '9',
        browser: 'mobile safari',
      },
      {
        os: 'android',
        minos: '5.0',
        browser: 'chrome',
      },
      {
        browser: 'ie',
        versions: [11, 'edge'],
      },
      {
        browser: 'edge',
      },
    ],
    mobile: [
      {
        os: 'ios',
        minos: '9',
        browser: 'mobile safari',
      },
      {
        os: 'ios',
        minos: '5.0',
        browser: 'chrome',
      },
      {
        os: 'android',
        minos: '5.0',
        browser: 'chrome',
        minversion: 50,
      },
    ],
  };

  const checkSupport = ({
    config,
    isInAppBrowserSupported,
  }: {
    config: BrowserConfig;
    isInAppBrowserSupported?: boolean;
  }) => new UnsupportedBrowserDetection(config, isInAppBrowserSupported);

  beforeEach(() => {
    document.documentElement.className = '';
  });

  describe('isSupported()', () => {
    it('should return true for supported browser', () => {
      setUserAgent(CHROME_UA);

      const detector = checkSupport({ config });

      expect(detector.isSupported()).toBe(true);
    });

    it('should return false for unsupported browser', () => {
      setUserAgent(IE_UA);

      const detector = checkSupport({ config });

      expect(detector.isSupported()).toBe(false);
    });

    it('should return true when is in-app browser and isInAppBrowserSupported equals true', () => {
      setUserAgent(FB_UA);

      const detector = checkSupport({ config, isInAppBrowserSupported: true });

      expect(detector.isSupported()).toBe(true);
    });

    it('should return false when is in-app browser and isInAppBrowserSupported equals false', () => {
      setUserAgent(FB_UA);

      const detector = checkSupport({ config, isInAppBrowserSupported: false });

      expect(detector.isSupported()).toBe(false);
    });

    it('should return true for crawler bots', () => {
      setUserAgent(CRAWLER_UA);
      const detector = checkSupport({ config });
      expect(detector.isSupported()).toBe(true);
    });
  });
});
