import React from 'react';

import { screen, waitFor } from '@testing-library/dom';
import { DemoItem } from '../demoItem.component';
import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import { DemoItemDocument } from '../../../shared/services/contentful';

describe('DemoItem: Component', () => {
  const component = () => <DemoItem />;
  const render = makeContextRenderer(component);

  it('should render item data', async () => {
    const apolloMocks = [
      {
        request: {
          query: DemoItemDocument,
        },
        result: {
          data: {
            demoItem: {
              title: 'First',
              description: 'Something more',
              image: { url: 'http://image.url', title: 'image alt' },
            },
          },
        },
      },
    ];

    render({}, { apolloMocks });
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Something more')).toBeInTheDocument();
      expect(screen.getByAltText('image alt')).toBeInTheDocument();
    });
  });

  it('should redirect to 404 if item doesnt exist', async () => {
    const apolloMocks = [
      {
        request: {
          query: DemoItemDocument,
        },
        result: {
          data: {
            demoItem: null,
          },
        },
      },
    ];
    const { pushSpy, history } = spiedHistory();

    render({}, { apolloMocks, router: { history } });
    await waitFor(() => {
      expect(pushSpy).toHaveBeenCalledWith('/en/404');
    });
  });
});
