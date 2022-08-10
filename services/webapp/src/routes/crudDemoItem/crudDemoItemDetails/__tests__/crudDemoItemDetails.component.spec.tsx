import { generatePath } from 'react-router';
import { screen } from '@testing-library/react';
import { OperationDescriptor } from 'react-relay/hooks';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import CrudDemoItemDetailsQuery from '../../../../__generated__/crudDemoItemDetailsQuery.graphql';
import { ContextData, makeContextRenderer } from '../../../../shared/utils/testUtils';
import { Routes } from '../../../../app/config/routes';
import { CrudDemoItemDetails } from '../crudDemoItemDetails.component';
import {getLocalePath} from "../../../../shared/utils/path";

describe('CrudDemoItemDetails: Component', () => {
  const routePath = getLocalePath(Routes.crudDemoItem.edit);
  const render = (context?: Partial<ContextData>) =>
    makeContextRenderer(() => <CrudDemoItemDetails />)(
      {},
      {
        ...context,
        router: {
          url: generatePath(routePath, { lang: 'en', id: 'test-id' }),
          routePath,
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
        url: generatePath(getLocalePath(Routes.crudDemoItem.details), { lang: 'en', id: 'test-id' }),
        routePath: Routes.crudDemoItem.details,
      },
    });

    expect(screen.getByText(/demo item name/i)).toBeInTheDocument();
  });
});
