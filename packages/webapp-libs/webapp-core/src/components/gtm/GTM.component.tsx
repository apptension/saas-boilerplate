import { useEffect } from 'react';

import * as analytics from '../../services/analytics';

export const GTM = () => {
  const isAnalyticsAvailable = analytics.isAvailable();
  useEffect(() => {
    const trackingId = analytics.getTrackingId();

    const script = document.createElement('script');
    const initScript = document.createElement('script');

    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    script.async = true;

    initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${trackingId}');
      `;

    document.body.appendChild(script);
    document.body.appendChild(initScript);

    return () => {
      document.body.removeChild(script);
      document.body.removeChild(initScript);
    };
  }, [isAnalyticsAvailable]);

  return null;
};
