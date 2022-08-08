import {screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

import { makeContextRenderer, spiedHistory } from '../../../shared/utils/testUtils';
import demoItemsAllQueryGraphql from '../../../__generated__/demoItemsAllQuery.graphql';
import { demoItemFactory } from '../../../mocks/factories';
import { DemoItems } from '../demoItems.component';

describe('DemoItems: Component', () => {
  const getRelayEnv = () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        DemoItemCollection() {
          return {
            items: [
              demoItemFactory({
                sys: { id: 'test-id-1' },
                title: 'First',
                image: { title: 'first image title', url: 'https://image.url' },
              }),
              demoItemFactory({
                sys: { id: 'test-id-2' },
                title: 'Second',
                image: { title: 'second image title', url: 'https://image.url' },
              }),
            ],
          };
        },
      })
    );
    relayEnvironment.mock.queuePendingOperation(demoItemsAllQueryGraphql, {});
    return relayEnvironment;
  };

  const component = () => <DemoItems />;
  const render = makeContextRenderer(component);

  it('should render all items', async () => {
    render({}, { relayEnvironment: getRelayEnv() });
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('should open single demo item page when link is clicked', async () => {
    const { pushSpy, history } = spiedHistory();
    render({}, { relayEnvironment: getRelayEnv(), router: { history } });
    await waitFor(() => {
      expect(screen.getByText('First')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByText('First'));
    expect(pushSpy).toHaveBeenCalledWith('/en/demo-items/test-id-1');
  });
});
