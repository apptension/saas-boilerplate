import { setUnsupportedClasses } from '../support';

describe('setUnsupportedClasses', () => {
  const originalClassName = document.documentElement.className;

  afterEach(() => {
    document.documentElement.className = originalClassName;
    document.title = '';
  });

  it('should add device type class to document element', () => {
    setUnsupportedClasses(false, 'mobile', () => false);

    expect(document.documentElement.className).toContain(`device-mobile`);
  });

  it('should add in-app-browser class to document element when in-app browser detected', () => {
    setUnsupportedClasses(true, 'mobile', () => false);

    expect(document.documentElement.className).toContain('in-app-browser');
  });

  it('should add unsupported class to document element when browser is not supported', () => {
    setUnsupportedClasses(false, 'mobile', () => false);

    expect(document.documentElement.className).toContain('unsupported');
  });

  it('should set unsupported page when browser is not supported', () => {
    document.body.innerHTML = `
      <div id="app"></div>
      <div class="unsupported-page" style="display: none;">
        <h1></h1>
      </div>
    `;

    setUnsupportedClasses(false, 'mobile', () => false);

    const unsupportedPageElement = document.querySelector('.unsupported-page') as HTMLElement | null;
    const appElement = document.querySelector('#app') as HTMLElement | null;
    const headline = unsupportedPageElement?.querySelector('h1');

    expect(unsupportedPageElement?.style.display).toBe('block');
    expect(appElement?.style.display).toBe('none');

    expect(headline?.innerText).toBe('Unsupported Browser');
    expect(document.title).toBe('Unsupported Browser');
  });

  it('should not set unsupported page when browser is supported', async () => {
    document.body.innerHTML = `
      <div id="app"></div>
      <div class="unsupported-page" style="display: none;">
        <h1></h1>
      </div>
    `;

    setUnsupportedClasses(true, 'desktop', () => true);

    const unsupportedPageElement = document.querySelector('.unsupported-page') as HTMLElement | null;
    const appElement = document.querySelector('#app') as HTMLElement | null;
    const headline = unsupportedPageElement?.querySelector('h1') as HTMLElement | null;

    expect(unsupportedPageElement?.style.display).toBe('none');
    expect(appElement).toBeInTheDocument();

    expect(headline?.innerText).toBe(undefined);
    expect(document.title).toBe('');
  });
});
