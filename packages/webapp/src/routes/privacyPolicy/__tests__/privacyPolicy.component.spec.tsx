import { screen } from '@testing-library/react';
import { append } from 'ramda';

import { appConfigFactory, fillContentfulAppConfigQuery } from '../../../mocks/factories';
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
});
