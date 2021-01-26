import { UAParser } from 'ua-parser-js';
import semverCompare from 'semver-compare';
import { pickBy } from 'ramda';

type Platform = 'desktop' | 'tablet' | 'mobile';

type BrowserVersion = number | string;

type RequirementType = 'browser' | 'minversion' | 'versions' | 'os' | 'minos';

interface BrowserRequirement {
  browser: string;
  minversion?: BrowserVersion;
  versions?: BrowserVersion[];
  os?: string;
  minos?: string;
}

type BrowserCheckResults = Record<RequirementType, boolean>;

export type BrowserConfig = Record<Platform, BrowserRequirement[]>;

const DEFAULT_SUPPORTED_BROWSERS_CONFIG: BrowserConfig = {
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

export default class UnsupportedBrowserDetection {
  parser = new UAParser();
  private supportedBrowsersConfig: BrowserConfig;
  private readonly isInAppBrowserSupported: boolean;

  constructor(config = DEFAULT_SUPPORTED_BROWSERS_CONFIG, isInAppBrowserSupported = true) {
    this.supportedBrowsersConfig = config;
    this.isInAppBrowserSupported = isInAppBrowserSupported;
  }

  get isInAppBrowser() {
    return this.ua.indexOf('FBAN') > -1 || this.ua.indexOf('FBAV') > -1 || this.ua.indexOf('Twitter') > -1;
  }

  get isCrawler() {
    return ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider', 'YandexBot'].some(
      crawlerName => this.ua.indexOf(crawlerName) > -1
    );
  }

  get device() {
    return this.parser.getDevice();
  }

  get ua() {
    return this.parser.getUA();
  }

  get browser() {
    return this.parser.getBrowser();
  }

  get os() {
    return this.parser.getOS();
  }

  get deviceType(): Platform {
    const { type = 'desktop' } = this.device;
    return type as Platform;
  }

  compareVersions(a: BrowserVersion | undefined, b: string | undefined) {
    if (!a || !b) {
      return false;
    }

    if (typeof a === 'string' || (a as any) instanceof String) {
      return semverCompare(a as string, b) <= 0;
    }

    return a <= parseInt(b, 10);
  }

  isSupported() {
    if (this.isCrawler) {
      return true;
    }

    if (this.isInAppBrowser) {
      return this.isInAppBrowserSupported;
    }

    const { version: browserVersion = '' } = this.browser;

    return this.supportedBrowsersConfig[this.deviceType].some((options: BrowserRequirement) => {
      const { os, minos, browser, minversion, versions } = options;
      const parsedVersion = isNaN(parseInt(browserVersion, 10))
        ? browserVersion.toLocaleLowerCase()
        : parseInt(browserVersion, 10);

      const checked: BrowserCheckResults = {
        os: os === this.os.name?.toLowerCase(),
        minos: this.compareVersions(minos, this.os.version),
        browser: browser === this.browser.name?.toLowerCase(),
        minversion: this.compareVersions(minversion, browserVersion),
        versions: versions ? versions.indexOf(parsedVersion) >= 0 : false,
      };

      const requiredChecks: BrowserCheckResults = pickBy((val, key) => Object.keys(options).includes(key), checked);
      return !Object.values(requiredChecks).includes(false);
    });
  }
}
