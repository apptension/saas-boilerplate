import React from 'react';

import { screen } from '@testing-library/dom';
import { PrivacyPolicy } from '../privacyPolicy.component';
import { makeContextRenderer } from '../../../shared/utils/testUtils';
import { prepareState } from '../../../mocks/store';
import { appConfigFactory } from '../../../mocks/factories';

describe('PrivacyPolicy: Component', () => {
  const privacyPolicy = 'Content example';
  const store = prepareState((state) => {
    state.config = appConfigFactory({ contentfulConfig: { privacyPolicy } });
  });

  const component = () => <PrivacyPolicy />;
  const render = makeContextRenderer(component);

  it('should render privacy policy content', () => {
    render({}, { store });
    expect(screen.getByText(privacyPolicy)).toBeInTheDocument();
  });
});
