import { screen } from '@testing-library/react';
import { createMockEnvironment } from 'relay-test-utils';
import { TermsAndConditions } from '../termsAndConditions.component';
import { appConfigFactory, fillContentfulAppConfigQuery } from '../../../mocks/factories';
import { fillCommonQueryWithUser } from '../../../shared/utils/commonQuery';
import { render } from '../../../tests/utils/rendering';

describe('TermsAndConditions: Component', () => {
  const termsAndConditions = 'Content example';

  const Component = () => <TermsAndConditions />;

  it('should render terms and conditions content', () => {
    const relayEnvironment = createMockEnvironment();
    fillCommonQueryWithUser(relayEnvironment);
    fillContentfulAppConfigQuery(relayEnvironment, {
      items: [appConfigFactory({ termsAndConditions })],
      limit: 1,
      skip: 0,
      total: 1,
    });
    render(<Component />, { relayEnvironment });
    expect(screen.getByText(termsAndConditions)).toBeInTheDocument();
  });
});
