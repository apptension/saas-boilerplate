import { MockedProvider as MockedApolloProvider, MockedProviderProps, MockedResponse } from '@apollo/client/testing';
import { StoryContext } from '@storybook/react';
import { RenderOptions, render, renderHook, waitFor } from '@testing-library/react';
import { ComponentClass, ComponentType, FC, PropsWithChildren, ReactElement } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { IntlProvider } from 'react-intl';
import { generatePath } from 'react-router';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';

import { DEFAULT_LOCALE, Locale, TranslationMessages, translationMessages } from '../../app/config/i18n';
import { RoutesConfig } from '../../app/config/routes';
import { LocalesProvider, SnackbarProvider } from '../../app/providers';
import { CommonQuery } from '../../app/providers/commonQuery';
import { ResponsiveThemeProvider } from '../../app/providers/responsiveThemeProvider';
import { SnackbarMessages } from '../../shared/components/layout/header/header.styles';
import { Snackbar } from '../../shared/components/snackbar';
import { fillCommonQueryWithUser } from '../../shared/utils/commonQuery';

export const PLACEHOLDER_TEST_ID = 'content';
export const PLACEHOLDER_CONTENT = <span data-testid="content">content</span>;

export type DefaultTestProvidersProps = PropsWithChildren<{
  apolloMocks?: ReadonlyArray<MockedResponse>;
  apolloProviderProps: MockedProviderProps;
  routerProps: MemoryRouterProps;
  intlLocale: Locale;
  intlMessages: TranslationMessages;
}>;

export function DefaultTestProviders({
  children,
  apolloMocks = [],
  apolloProviderProps = {},
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
                <MockedApolloProvider addTypename={false} {...apolloProviderProps} mocks={apolloMocks}>
                  <CommonQuery>
                    {children}
                    <SnackbarMessages>
                      <Snackbar />
                    </SnackbarMessages>
                  </CommonQuery>
                </MockedApolloProvider>
              </IntlProvider>
            </SnackbarProvider>
          </LocalesProvider>
        </ResponsiveThemeProvider>
      </HelmetProvider>
    </MemoryRouter>
  );
}

export type WrapperProps<P extends DefaultTestProvidersProps = DefaultTestProvidersProps> = Partial<
  Omit<P, 'apolloMocks'>
> & {
  apolloMocks?:
    | ReadonlyArray<MockedResponse>
    | ((mocks: ReadonlyArray<MockedResponse>, storyContext?: StoryContext) => ReadonlyArray<MockedResponse>);
};

export function getWrapper<P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  WrapperComponent: ComponentClass<P> | FC<P>,
  wrapperProps: WrapperProps<P>,
  storyContext?: StoryContext
): {
  wrapper: ComponentType<P>;
  waitForApolloMocks: (mockIndex?: number) => Promise<void>;
} {
  const apolloMocks = (() => {
    const defaultApolloMocks = [fillCommonQueryWithUser()];

    if (typeof wrapperProps.apolloMocks === 'function') {
      return wrapperProps.apolloMocks(defaultApolloMocks, storyContext);
    }

    if (wrapperProps.apolloMocks !== undefined) {
      return wrapperProps.apolloMocks;
    }

    return defaultApolloMocks;
  })();

  const defaultRouterProps: MemoryRouterProps = { initialEntries: ['/'] };

  const waitForApolloMocks = async (mockIndex: number = apolloMocks.length - 1) => {
    if (!apolloMocks.length) {
      return Promise.resolve();
    }

    await waitFor(() => expect(apolloMocks[mockIndex].result).toHaveBeenCalled());
  };

  const wrapper = (props) => {
    return (
      <WrapperComponent
        {...props}
        routerProps={defaultRouterProps}
        intlLocale={DEFAULT_LOCALE}
        intlMessages={translationMessages[DEFAULT_LOCALE]}
        {...(wrapperProps ?? {})}
        apolloMocks={apolloMocks}
      />
    );
  };

  return {
    wrapper,
    waitForApolloMocks,
  };
}

export type CustomRenderOptions<P extends DefaultTestProvidersProps = DefaultTestProvidersProps> = RenderOptions &
  WrapperProps<P>;

function customRender<P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  ui: ReactElement,
  options: CustomRenderOptions<P> = {}
) {
  const { wrapper, waitForApolloMocks } = getWrapper(DefaultTestProviders, options);

  return {
    ...render(ui, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

function customRenderHook<Result, Props, P extends DefaultTestProvidersProps = DefaultTestProvidersProps>(
  hook: (initialProps: Props) => Result,
  options: CustomRenderOptions<P> = {}
) {
  const { wrapper, waitForApolloMocks } = getWrapper(DefaultTestProviders, options);

  return {
    ...renderHook(hook, {
      ...options,
      wrapper,
    }),
    waitForApolloMocks,
  };
}

export { customRender as render, customRenderHook as renderHook };

export const createMockRouterProps = (
  pathName: string | Array<string>,
  params?: Record<string, any>
): MemoryRouterProps => {
  return {
    initialEntries: [
      generatePath(RoutesConfig.getLocalePath(Array.isArray(pathName) ? pathName : [pathName]), {
        lang: 'en',
        ...(params ?? {}),
      }),
    ],
  };
};
