import { screen } from '@testing-library/react';
import { TermsAndConditions } from '../termsAndConditions.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';
import { appConfigFactory } from '../../../mocks/factories';

describe('TermsAndConditions: Component', () => {
  const termsAndConditions = 'Content example';

  const component = () => <TermsAndConditions />;
  const render = makeContextRenderer(component, {
    store: (state) => {
      state.config = appConfigFactory({ contentfulConfig: { termsAndConditions } });
    },
  });

  it('should render terms and conditions content', () => {
    render();
    expect(screen.getByText(termsAndConditions)).toBeInTheDocument();
  });
});
