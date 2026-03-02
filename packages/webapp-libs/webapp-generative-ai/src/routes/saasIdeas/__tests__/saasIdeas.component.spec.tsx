import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { GraphQLError } from 'graphql/error';
import { append } from 'ramda';

import { render } from '../../../tests/utils/rendering';
import { SaasIdeas } from '../saasIdeas.component';
import { generateSaasIdeasMutation } from '../saasIdeas.graphql';

const mockStop = jest.fn();
jest.mock('typewriter-effect/dist/core', () =>
  jest.fn().mockImplementation(() => ({
    stop: mockStop,
  }))
);

describe('SaasIdeas: Component', () => {
  const Component = () => <SaasIdeas />;

  const getKeywordInput = () => screen.findByPlaceholderText(/type your keywords here/i);
  const getSubmitBtn = () => screen.getByRole('button', { name: '' }); // Send button has icon only

  it('should display empty form', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const input = await getKeywordInput();
    expect(input).toHaveValue('');
  });

  it('should show error if input is empty', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const submitBtn = await screen.findByRole('button', { name: '' });
    await userEvent.click(submitBtn);
    expect(await screen.findByText('Keywords is required')).toBeInTheDocument();
  });

  it('should show results', async () => {
    const response = 'Here are some SaaS ideas for you';
    const keywords = ['test_keyword'];

    const mutationMock = composeMockedQueryResult(generateSaasIdeasMutation, {
      data: {
        generateSaasIdeas: {
          response,
        },
      },
      variables: {
        input: {
          keywords,
        },
      },
    });

    const { waitForApolloMocks } = render(<Component />, { apolloMocks: append(mutationMock) });
    await waitForApolloMocks(0);
    await userEvent.type(await getKeywordInput(), keywords.join(' '));
    const submitBtn = await screen.findByRole('button', { name: '' });
    await userEvent.click(submitBtn);
    await waitForApolloMocks();
    expect(await screen.findByText(response)).toBeInTheDocument();
  });

  it('should show error', async () => {
    const keywords = ['test_keyword'];

    const errors = [new GraphQLError('error')];
    const mutationMock = composeMockedQueryResult(generateSaasIdeasMutation, {
      data: {
        generateSaasIdeas: null,
      },
      errors: errors,
      variables: {
        input: {
          keywords,
        },
      },
    });

    const { waitForApolloMocks } = render(<Component />, {
      apolloMocks: (defaultMocks) => defaultMocks.concat(mutationMock),
    });
    await waitForApolloMocks(0);
    await userEvent.type(await getKeywordInput(), keywords.join(' '));
    const submitBtn = await screen.findByRole('button', { name: '' });
    await userEvent.click(submitBtn);
    await waitForApolloMocks();

    expect(await screen.findByText('error')).toBeInTheDocument();
  });
});
