import { screen } from '@testing-library/react';
import { append } from 'ramda';

import { appConfigFactory, fillContentfulAppConfigQuery } from '../../../mocks/factories';
import { render } from '../../../tests/utils/rendering';
import { TermsAndConditions } from '../termsAndConditions.component';

describe('TermsAndConditions: Component', () => {
  const termsAndConditions = 'Content example';

  const Component = () => <TermsAndConditions />;

  it('should render terms and conditions content', async () => {
    render(<Component />, {
      apolloMocks: append(
        fillContentfulAppConfigQuery(undefined, {
          items: [appConfigFactory({ termsAndConditions })],
          limit: 1,
          skip: 0,
          total: 1,
        })
      ),
    });
    expect(await screen.findByText(termsAndConditions)).toBeInTheDocument();
  });
});
