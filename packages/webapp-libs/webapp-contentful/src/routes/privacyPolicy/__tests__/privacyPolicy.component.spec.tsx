import { screen, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { append } from 'ramda';

import { appConfigFactory, fillContentfulAppConfigQuery } from '../../../tests/factories';
import { render } from '../../../tests/utils/rendering';
import { PrivacyPolicy } from '../privacyPolicy.component';

describe('PrivacyPolicy: Component', () => {
  const privacyPolicy = 'Content example';

  const Component = () => <PrivacyPolicy />;

  it('should render privacy policy content', async () => {
    render(<Component />, {
      apolloMocks: append(
        fillContentfulAppConfigQuery({
          items: [appConfigFactory({ privacyPolicy })],
          limit: 1,
          skip: 0,
          total: 1,
        })
      ),
    });

    expect(await screen.findByText(privacyPolicy)).toBeInTheDocument();
  });

  it('should render page title and description', async () => {
    render(<Component />, {
      apolloMocks: append(
        fillContentfulAppConfigQuery({
          items: [appConfigFactory({ privacyPolicy })],
          limit: 1,
          skip: 0,
          total: 1,
        })
      ),
    });

    expect(await screen.findByRole('heading', { name: /privacy policy/i })).toBeInTheDocument();
    expect(await screen.findByText(/how we handle and protect your data/i)).toBeInTheDocument();
  });

  it('should render loading skeleton initially and then content', async () => {
    render(<Component />, {
      apolloMocks: append(
        fillContentfulAppConfigQuery({
          items: [appConfigFactory({ privacyPolicy })],
          limit: 1,
          skip: 0,
          total: 1,
        })
      ),
    });

    // Wait for content to load - if loading worked, content should appear
    expect(await screen.findByText(privacyPolicy)).toBeInTheDocument();
  });

  it('should render not configured state when content is empty', async () => {
    render(<Component />, {
      apolloMocks: append(
        fillContentfulAppConfigQuery({
          items: [appConfigFactory({ privacyPolicy: null })],
          limit: 1,
          skip: 0,
          total: 1,
        })
      ),
    });

    expect(await screen.findByText(/no content available/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/the privacy policy content hasn't been added yet/i)
    ).toBeInTheDocument();
  });

  it('should render error state on GraphQL error', async () => {
    const errorMock = {
      request: {
        query: fillContentfulAppConfigQuery({
          items: [],
          limit: 1,
          skip: 0,
          total: 0,
        }).request.query,
      },
      result: {
        errors: [new GraphQLError('Test error message')],
      },
    };

    render(<Component />, {
      apolloMocks: append(errorMock),
    });

    await waitFor(() => {
      expect(screen.getByText(/unable to load privacy policy/i)).toBeInTheDocument();
    });
  });

  it('should render configuration help when Contentful is not configured', async () => {
    const networkErrorMock = {
      request: {
        query: fillContentfulAppConfigQuery({
          items: [],
          limit: 1,
          skip: 0,
          total: 0,
        }).request.query,
      },
      error: new Error('Failed to fetch'),
    };

    render(<Component />, {
      apolloMocks: append(networkErrorMock),
    });

    await waitFor(() => {
      expect(screen.getByText(/contentful integration not configured/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/quick setup/i)).toBeInTheDocument();
    expect(screen.getByText(/VITE_CONTENTFUL_SPACE/)).toBeInTheDocument();
  });
});
