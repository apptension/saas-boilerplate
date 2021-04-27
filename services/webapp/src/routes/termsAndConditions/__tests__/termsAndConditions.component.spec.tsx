import React from 'react';
import { screen } from '@testing-library/react';
import { TermsAndConditions } from '../termsAndConditions.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { appConfigFactory } from '../../../mocks/factories';

describe('TermsAndConditions: Component', () => {
  const termsAndConditions = 'Content example';
  const store = prepareState((state) => {
    state.config = appConfigFactory({ contentfulConfig: { termsAndConditions } });
  });

  const component = () => <TermsAndConditions />;
  const render = makeContextRenderer(component);

  it('should render terms and conditions content', () => {
    render({}, { store });
    expect(screen.getByText(termsAndConditions)).toBeInTheDocument();
  });
});
