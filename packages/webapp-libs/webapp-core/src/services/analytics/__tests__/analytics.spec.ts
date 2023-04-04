import { setUserId, trackEvent } from '../';
import { ENV } from '../../../config/env';

const trackingId = 'TEST_TRACKING_ID';
const userId = 'TEST_USER_ID';

describe('analytics', () => {
  let gtagSpy: jest.SpyInstance;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    gtagSpy = jest.fn();
    // @ts-ignore
    window.gtag = gtagSpy;
    console.log = jest.fn();

    ENV.ENVIRONMENT_NAME = 'production';
    ENV.GOOGLE_ANALYTICS_TRACKING_ID = trackingId;
  });

  afterEach(() => {
    jest.resetAllMocks();
    console.log = originalConsoleLog;
  });

  describe('trackEvent', () => {
    it('log an event in analytics', () => {
      const category = 'auth';
      const action = 'log-in';
      const label = 'test label';

      trackEvent(category, action, label);

      expect(gtagSpy).toHaveBeenCalledWith('event', action, { event_category: category, event_label: label });
      expect(console.log).not.toBeCalled();
    });
    it('do not log an event in analytics if tracking id is undefined', () => {
      ENV.GOOGLE_ANALYTICS_TRACKING_ID = undefined;

      const category = 'auth';
      const action = 'log-in';
      const label = 'test label';

      trackEvent(category, action, label);

      expect(gtagSpy).not.toHaveBeenCalled();
      expect(console.log).not.toBeCalled();
    });
    it('console log an event in analytics in development environment', () => {
      ENV.ENVIRONMENT_NAME = 'local';

      const category = 'auth';
      const action = 'log-in';
      const label = 'test label';

      trackEvent(category, action, label);

      expect(gtagSpy).toHaveBeenCalledWith('event', action, { event_category: category, event_label: label });
      expect(console.log).toHaveBeenCalledWith('[Analytics] track event:', category, action, label);
    });
  });

  describe('setUserId', () => {
    it('set user id in analytics', () => {
      setUserId(userId);

      expect(gtagSpy).toHaveBeenCalledWith('set', { user_id: userId });
    });
    it('do not set user id in analytics if tracking id is undefined', () => {
      const trackingId = undefined;

      ENV.GOOGLE_ANALYTICS_TRACKING_ID = trackingId;

      setUserId(userId);

      expect(gtagSpy).not.toBeCalled();
      expect(console.log).not.toBeCalled();
    });
    it('console log an event in development environment', () => {
      ENV.ENVIRONMENT_NAME = 'local';

      setUserId(userId);

      expect(gtagSpy).toBeCalled();
      expect(console.log).toHaveBeenCalledWith('[Analytics] set userId:', userId);
    });
  });
});
