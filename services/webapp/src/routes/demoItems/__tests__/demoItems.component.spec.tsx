import React from 'react';

import { screen, waitFor } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import { DemoItems } from '../demoItems.component';
import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import { AllDemoItemsDocument } from '../../../shared/services/contentful';

describe('DemoItems: Component', () => {
  const apolloMocks = [
    {
      request: {
        query: AllDemoItemsDocument,
      },
      result: {
        data: {
          demoItemCollection: {
            items: [
              { sys: { id: 1 }, title: 'First' },
              { sys: { id: 2 }, title: 'Second' },
            ],
          },
        },
      },
    },
  ];

  const component = () => <DemoItems />;
  const render = makeContextRenderer(component);

  it('should render all items', async () => {
    render({}, { apolloMocks });
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
    });
  });

  it('should open single demo item page when link is clicked', async () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { apolloMocks, router: { history } });
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('First'));
    expect(pushSpy).toHaveBeenCalledWith('/en/demo-items/1');
  });
});
