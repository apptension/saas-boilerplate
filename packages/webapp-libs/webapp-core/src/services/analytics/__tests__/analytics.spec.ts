import { event, initialize, set } from 'react-ga';

import { initAnalytics, setUserId, trackEvent } from '../';
import { ENV } from '../../../config/env';

jest.mock('react-ga');

const trackingId = 'TEST_TRACKING_ID';
const userId = 'TEST_USER_ID';

describe('analytics', () => {
  const originalConsoleLog = console.log;

  beforeEach(() => {
    console.log = jest.fn();

    ENV.ENVIRONMENT_NAME = 'production';
    ENV.GOOGLE_ANALYTICS_TRACKING_ID = trackingId;
  });

  afterEach(() => {
    jest.resetAllMocks();
    console.log = originalConsoleLog;
  });

  describe('initAnalytics', () => {
    it('initialization', () => {
      initAnalytics();

      expect(initialize).toHaveBeenCalledWith(trackingId);
    });
    it('skip initialization if tracking id is undefined', () => {
      const trackingId = undefined;

      ENV.GOOGLE_ANALYTICS_TRACKING_ID = trackingId;

      initAnalytics();

      expect(initialize).not.toHaveBeenCalledWith(trackingId);
    });
  });

  describe('trackEvent', () => {
    it('log an event in analytics', () => {
      const category = 'auth';
      const action = 'log-in';
      const label = 'test label';

      trackEvent(category, action, label);

      expect(event).toHaveBeenCalledWith({ category, action, label });
      expect(console.log).not.toBeCalled();
    });
    it('do not log an event in analytics if tracking id is undefined', () => {
      const trackingId = undefined;

      ENV.GOOGLE_ANALYTICS_TRACKING_ID = trackingId;

      const category = 'auth';
      const action = 'log-in';
      const label = 'test label';

      trackEvent(category, action, label);

      expect(event).not.toHaveBeenCalledWith({ category, action, label });
      expect(console.log).not.toBeCalled();
    });
    it('console log an event in analytics in development environment', () => {
      ENV.ENVIRONMENT_NAME = 'local';

      const category = 'auth';
      const action = 'log-in';
      const label = 'test label';

      trackEvent(category, action, label);

      expect(event).toHaveBeenCalledWith({ category, action, label });
      expect(console.log).toHaveBeenCalledWith('[Analytics] track event:', category, action, label);
    });
  });

  describe('setUserId', () => {
    it('set user id in analytics', () => {
      setUserId(userId);

      expect(set).toHaveBeenCalledWith({ userId });
    });
    it('do not set user id in analytics if tracking id is undefined', () => {
      const trackingId = undefined;

      ENV.GOOGLE_ANALYTICS_TRACKING_ID = trackingId;

      setUserId(userId);

      expect(set).not.toBeCalled();
      expect(console.log).not.toBeCalled();
    });
    it('console log an event in development environment', () => {
      ENV.ENVIRONMENT_NAME = 'local';

      setUserId(userId);

      expect(set).toBeCalled();
      expect(console.log).toHaveBeenCalledWith('[Analytics] set userId:', userId);
    });
  });
});
