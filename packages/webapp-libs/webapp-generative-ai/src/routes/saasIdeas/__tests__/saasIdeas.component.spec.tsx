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

  const getKeywordInput = () => screen.findByLabelText(/keywords/i);
  const getSubmitBtn = () => screen.getByRole('button');

  it('should display empty form', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const value = (await getKeywordInput()).getAttribute('value');
    expect(value).toBe('');
  });

  it('should show error if input is empty', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    await userEvent.click(getSubmitBtn());
    expect(await screen.findByText('Keywords is required')).toBeInTheDocument();
  });

  it('should show results', async () => {
    const ideas = ['idea 1', 'idea 2'];
    const keywords = ['test_keyword'];

    const mutationMock = composeMockedQueryResult(generateSaasIdeasMutation, {
      data: {
        generateSaasIdeas: {
          ideas,
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
    await userEvent.click(getSubmitBtn());
    await waitForApolloMocks();
    expect(await screen.findByText(ideas[0])).toBeInTheDocument();
    expect(await screen.findByText(ideas[1])).toBeInTheDocument();
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
    await userEvent.click(getSubmitBtn());
    await waitForApolloMocks();

    expect(await screen.findByText('error')).toBeInTheDocument();
  });
});
