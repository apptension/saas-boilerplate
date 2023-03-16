export const setUnsupportedClasses = (
  isInAppBrowser: boolean,
  deviceType: 'mobile' | 'tablet' | 'desktop',
  isSupported: () => boolean
) => {
  document.documentElement.className += ` device-${deviceType}`;

  if (isInAppBrowser) {
    document.documentElement.className += ' in-app-browser';
  }

  if (!isSupported()) {
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
