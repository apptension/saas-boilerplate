import { Queries, queries } from '@testing-library/dom';
import { RenderOptions, RenderResult, render, renderHook } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';

import { TooltipProvider } from '../../components/ui/tooltip';
import { DEFAULT_LOCALE, Locale, TranslationMessages, translationMessages } from '../../config/i18n';
import { LocalesProvider, ResponsiveThemeProvider } from '../../providers';
import { ToastProvider, Toaster } from '../../toast';

/**
 * A set of properties that are passed to [`CoreTestProviders`](#coretestproviders) component to override the initial
 * state of providers
 */
export type CoreTestProvidersProps = PropsWithChildren<{
  routerProps: MemoryRouterProps;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
}>;

/**
 * Component that renders a set of providers used in tests globally like: `MemoryRouter`, `LocalesProvider`,
 * `ToastProvider`, `IntlProvider`, etc...
 *
 * It is used in [`render`](#render) and [`renderHook`](#renderhook) methods.
 * @param children
 * @param routerProps
 * @param intlMessages
 * @param intlLocale
 * @constructor
 */
export function CoreTestProviders({ children, routerProps, intlMessages, intlLocale }: CoreTestProvidersProps) {
  return (
    <MemoryRouter {...routerProps}>
      <HelmetProvider>
        <ResponsiveThemeProvider>
          <LocalesProvider>
            <ToastProvider>
              <TooltipProvider>
                <IntlProvider locale={intlLocale} messages={intlMessages}>
                  <>
                    {children}
                    <Toaster />
                  </>
                </IntlProvider>
              </TooltipProvider>
            </ToastProvider>
          </LocalesProvider>
        </ResponsiveThemeProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

export type WrapperProps = Partial<CoreTestProvidersProps>;

/** @ignore */
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

export type CustomRenderOptions<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
> = RenderOptions<Q, Container, BaseElement> & WrapperProps;

/**
 * Method that extends [`render`](https://testing-library.com/docs/react-testing-library/api#render) method from
 * `@testing-library/react` package. It composes a wrapper using [`CoreTestProviders`](#coretestproviders) component and
 * `options` property that is passed down to parent `render` method.
 * @param ui
 * @param options
 */
function customRender<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  ui: ReactElement,
  options: CustomRenderOptions<Q, Container, BaseElement> = {}
): RenderResult<Q, Container, BaseElement> {
  const { wrapper } = getWrapper(CoreTestProviders, options);

  return {
    ...render<Q, Container, BaseElement>(ui, {
      ...options,
      wrapper,
    }),
  };
}

/**
 * Method that extends [`renderHook`](https://testing-library.com/docs/react-testing-library/api#renderhook) method from
 * `@testing-library/react` package. It composes a wrapper using [`CoreTestProviders`](#coretestproviders) component and
 * `options` property that is passed down to parent `renderHook` method.
 * @param hook
 * @param options
 */
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

/** @ignore */
export const PLACEHOLDER_TEST_ID = 'content';
/** @ignore */
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;
