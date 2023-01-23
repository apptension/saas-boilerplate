import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { PrivacyPolicy } from '../privacyPolicy.component';
import { render } from '../../../tests/utils/rendering';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { appConfigFactory, fillContentfulAppConfigQuery } from '../../../mocks/factories';

describe('PrivacyPolicy: Component', () => {
  const privacyPolicy = 'Content example';

  const Component = () => <PrivacyPolicy />;

  it('should render privacy policy content', () => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    fillContentfulAppConfigQuery(relayEnvironment, {
      items: [appConfigFactory({ privacyPolicy })],
      limit: 1,
      skip: 0,
      total: 1,
    });

    render(<Component />, { relayEnvironment });
    expect(screen.getByText(privacyPolicy)).toBeInTheDocument();
  });
});
