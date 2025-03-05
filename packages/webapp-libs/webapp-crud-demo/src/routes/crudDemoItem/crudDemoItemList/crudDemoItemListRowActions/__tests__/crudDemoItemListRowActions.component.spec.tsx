import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { getTenantPathHelper } from '@sb/webapp-core/utils';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Route, Routes, useParams } from 'react-router';

import { RoutesConfig } from '../../../../../config/routes';
import { render } from '../../../../../tests/utils/rendering';
import { CrudDemoItemListRowActions, CrudDemoItemListRowActionsProps } from '../crudDemoItemListRowActions.component';
import { crudDemoItemListRowActionsDeleteMutation } from '../crudDemoItemListRowActions.graphql';

jest.mock('@sb/webapp-core/services/analytics');

describe('CrudDemoItemListRowActions: Component', () => {
  const defaultProps: CrudDemoItemListRowActionsProps = {
    id: 'id',
  };
  const currentUser = currentUserFactory();
  const EditRouteMock = () => {
    const params = useParams<{ id: string }>();

    return <span>Crud demo item edit mock {params.id}</span>;
  };

  const Component = (props: Partial<CrudDemoItemListRowActionsProps>) => {
    return (
      <Routes>
        <Route path="/" element={<CrudDemoItemListRowActions {...defaultProps} {...props} />} />
        <Route path={getTenantPathHelper(RoutesConfig.crudDemoItem.edit)} element={<EditRouteMock />} />
      </Routes>
    );
  };

  it('should render row actions menu', async () => {
    render(<Component />);
    await waitFor(() => expect(screen.getByTestId('toggle-button')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('toggle-button'));
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });

  it('should navigate to edit page', async () => {
    render(<Component />, { apolloMocks: () => [fillCommonQueryWithUser(currentUser)] });

    await waitFor(() => expect(screen.getByTestId('toggle-button')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('toggle-button'));
    await userEvent.click(screen.getByText(/edit/i));
    await waitFor(() => expect(screen.getByText(`Crud demo item edit mock ${defaultProps.id}`)).toBeInTheDocument());
  });

  it('should delete item and show success message', async () => {
    render(<Component />, {
      apolloMocks: () => [
        fillCommonQueryWithUser(currentUser),
        composeMockedQueryResult(crudDemoItemListRowActionsDeleteMutation, {
          data: {
            deleteCrudDemoItem: {
              deletedIds: [defaultProps.id],
              __typename: 'DeleteCrudDemoItemMutationPayload',
            },
          },
          variables: {
            input: { id: defaultProps.id, tenantId: currentUser?.tenants?.[0]?.id },
          },
        }),
      ],
    });

    await waitFor(() => expect(screen.getByTestId('toggle-button')).toBeInTheDocument());
    await userEvent.click(screen.getByTestId('toggle-button'));
    await userEvent.click(screen.getByText(/delete/i));
    await userEvent.click(screen.getByText(/Delete item/i));

    await waitFor(() => expect(trackEvent).toBeCalledWith('crud', 'delete', defaultProps.id));

    const toast = await screen.findByTestId('toast-1');
    expect(toast).toHaveTextContent('🎉 Item deleted successfully!');
  });
});
