import { render, renderHook, RenderOptions } from '@testing-library/react';
import {
  ComponentClass,
  ComponentType,
  FC,
  PropsWithChildren,
  ReactElement,
} from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';
import styled from 'styled-components';

import {
  DEFAULT_LOCALE,
  Locale,
  TranslationMessages,
  translationMessages,
} from '../../config/i18n';
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

export type DefaultTestProvidersProps = PropsWithChildren<{
  routerProps: MemoryRouterProps;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
}>;

export function DefaultTestProviders({
  children,
  routerProps,
  intlMessages,
  intlLocale,
}: DefaultTestProvidersProps) {
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

export type WrapperProps<
  P extends DefaultTestProvidersProps = DefaultTestProvidersProps
> = Partial<P>;

export function getWrapper<
  P extends DefaultTestProvidersProps = DefaultTestProvidersProps
>(
  WrapperComponent: ComponentClass<P> | FC<P>,
  wrapperProps: WrapperProps<P>
): {
  wrapper: ComponentType<P>;
} {
  const defaultRouterProps: MemoryRouterProps = { initialEntries: ['/'] };

  const wrapper = (props: P) => {
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

export type CustomRenderOptions<
  P extends DefaultTestProvidersProps = DefaultTestProvidersProps
> = RenderOptions & WrapperProps<P>;

function customRender<
  P extends DefaultTestProvidersProps = DefaultTestProvidersProps
>(ui: ReactElement, options: CustomRenderOptions<P> = {}) {
  const { wrapper } = getWrapper(DefaultTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
  };
}

function customRenderHook<
  Result,
  Props,
  P extends DefaultTestProvidersProps = DefaultTestProvidersProps
>(hook: (initialProps: Props) => Result, options: CustomRenderOptions<P> = {}) {
  const { wrapper } = getWrapper(DefaultTestProviders, options);

  return {
    ...renderHook(hook, {
      ...options,
      wrapper,
    }),
  };
}

export { customRender as render, customRenderHook as renderHook };
