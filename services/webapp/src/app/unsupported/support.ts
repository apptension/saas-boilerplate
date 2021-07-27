import { UnsupportedBrowserDetection } from './unsupportedBrowserDetection';

const detection = new UnsupportedBrowserDetection();

export const setUnsupportedClasses = () => {
  document.documentElement.className += ` device-${detection.deviceType}`;

  if (detection.isInAppBrowser) {
    document.documentElement.className += ' in-app-browser';
  }

  if (!detection.isSupported()) {
    document.documentElement.className += ' unsupported';
    const unsupportedPageElement = document.querySelector<HTMLElement>('.unsupported-page');
    const headline = unsupportedPageElement?.querySelector<HTMLElement>('h1');
    const appElement = document.querySelector<HTMLElement>('#app');

    if (unsupportedPageElement && headline && appElement) {
      unsupportedPageElement.style.display = 'block';
      appElement.style.display = 'none';

      headline.innerText = 'Unsupported Browser';
      document.title = 'Unsupported Browser';
    }
  }
};
