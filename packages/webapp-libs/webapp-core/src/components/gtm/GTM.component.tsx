import { useEffect } from 'react';

import { getTrackingId, isAvailable } from '../../services/analytics';

export const GTM = () => {
  useEffect(() => {
    const trackingId = getTrackingId();

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
  }, [isAvailable()]);

  return null;
};
