import { RenderOptions, render, renderHook } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import styled from 'styled-components';

import { DEFAULT_LOCALE, Locale, TranslationMessages, translationMessages } from '../../config/i18n';
import { LocalesProvider, ResponsiveThemeProvider } from '../../providers';
import { Snackbar, SnackbarProvider } from '../../snackbar';
import { media, size } from '../../theme';

export const SnackbarMessages = styled.div`
  position: fixed;
  top: ${size.sizeUnits(1)};
  z-index: 1;
  width: 100%;

  ${media.media(media.Breakpoint.TABLET)`
    top: ${size.sizeUnits(3)};
    width: auto;
    left: 50%;
    transform: translateX(-50%);
  `}
`;

export type CoreTestProvidersProps = PropsWithChildren<{
  routerProps: MemoryRouterProps;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
}>;

export function CoreTestProviders({ children, routerProps, intlMessages, intlLocale }: CoreTestProvidersProps) {
  return (
    <MemoryRouter {...routerProps}>
      <HelmetProvider>
        <ResponsiveThemeProvider>
          <LocalesProvider>
            <SnackbarProvider>
              <IntlProvider locale={intlLocale} messages={intlMessages}>
                <>
                  {children}
                  <SnackbarMessages>
                    <Snackbar />
                  </SnackbarMessages>
                </>
              </IntlProvider>
            </SnackbarProvider>
          </LocalesProvider>
        </ResponsiveThemeProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

export type WrapperProps = Partial<CoreTestProvidersProps>;

export function getWrapper(
  WrapperComponent: ComponentClass<CoreTestProvidersProps> | FC<CoreTestProvidersProps>,
  wrapperProps: WrapperProps
): {
  wrapper: ComponentType<WrapperProps>;
} {
  const defaultRouterProps: MemoryRouterProps = { initialEntries: ['/'] };

  const wrapper = (props: PropsWithChildren<WrapperProps>) => {
    return (
      <WrapperComponent
        {...props}
        routerProps={defaultRouterProps}
        intlLocale={DEFAULT_LOCALE}
        intlMessages={translationMessages[DEFAULT_LOCALE]}
        {...(wrapperProps ?? {})}
      />
    );
  };

  return {
    wrapper,
  };
}

export type CustomRenderOptions = RenderOptions & WrapperProps;

function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { wrapper } = getWrapper(CoreTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
  };
}

function customRenderHook<Result, Props>(hook: (initialProps: Props) => Result, options: CustomRenderOptions = {}) {
  const { wrapper } = getWrapper(CoreTestProviders, options);

  return {
    ...renderHook(hook, {
      ...options,
      wrapper,
    }),
  };
}

export { customRender as render, customRenderHook as renderHook };

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;
