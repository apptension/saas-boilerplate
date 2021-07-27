import { generatePath } from 'react-router';
import { screen } from '@testing-library/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import CrudDemoItemDetailsQuery from '../../../../__generated__/crudDemoItemDetailsQuery.graphql';
import { ContextData, makeContextRenderer } from '../../../../shared/utils/testUtils';
import { ROUTES } from '../../../../app/config/routes';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';

describe('CrudDemoItemDetails: Component', () => {
  const render = (context?: Partial<ContextData>) =>
    makeContextRenderer(() => <CrudDemoItemDetails />)(
      {},
      {
        ...context,
        router: {
          url: generatePath(ROUTES.crudDemoItem.edit, { lang: 'en', id: 'test-id' }),
          routePath: ROUTES.crudDemoItem.edit,
        },
      }
    );

  it('should render item details', () => {
    const relayEnvironment = createMockEnvironment();
    relayEnvironment.mock.queueOperationResolver((operation: OperationDescriptor) =>
      MockPayloadGenerator.generate(operation, {
        CrudDemoItemType: () => ({ name: 'demo item name' }),
      })
    );
    relayEnvironment.mock.queuePendingOperation(CrudDemoItemDetailsQuery, { id: 'test-id' });

    render({
      relayEnvironment,
      router: {
        url: generatePath(ROUTES.crudDemoItem.details, { lang: 'en', id: 'test-id' }),
        routePath: ROUTES.crudDemoItem.details,
      },
    });

    expect(screen.getByText(/demo item name/gi)).toBeInTheDocument();
  });
});
