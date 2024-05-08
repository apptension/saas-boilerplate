import { commonQueryCurrentUserQuery } from '@sb/webapp-api-client/providers';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { RoutesConfig } from '../../../config/routes';
import { tenantFactory } from '../../../tests/factories/tenant';
import { createMockRouterProps, render } from '../../../tests/utils/rendering';
import { TenantDangerZone } from '../tenantDangerZone.component';
import { deleteTenantMutation } from '../tenantDangerZone.graphql';


describe('TenantDangerSettings: Component', () => {
  const Component = () => <TenantDangerZone />;

  it('should commit update mutation', async () => {
    const user = currentUserFactory({
      tenants: [
        tenantFactory({
          name: 'name',
          id: '1',
        })
      ],
    });
    const commonQueryMock = fillCommonQueryWithUser(user);

    const variables = {
      input: { id: '1' },
    };

    const data = {
      deleteTenant: {
        deletedIds: ['1']
      },
    };

    const requestMock = composeMockedQueryResult(deleteTenantMutation, {
      variables,
      data,
    });

    const currentUserRefetchData = {
      ...user,
      tenants: [],
    };

    const refetchMock = composeMockedQueryResult(commonQueryCurrentUserQuery, {
      data: currentUserRefetchData,
    });

    requestMock.newData = jest.fn(() => ({
      data,
    }));

    refetchMock.newData = jest.fn(() => ({
      data: {
        currentUser: currentUserRefetchData,
      },
    }));

    const routerProps = createMockRouterProps(RoutesConfig.tenant.settings.general, { tenantId: '1' });

    render(<Component />, { apolloMocks: [commonQueryMock, requestMock, refetchMock], routerProps });
    await userEvent.click(await screen.findByRole('button', { name: /remove organisation/i }));
    expect(requestMock.newData).toHaveBeenCalled();
    const toast = await screen.findByTestId('toast-1');

    expect(toast).toHaveTextContent('🎉 Tenant removed successfully!');
  });
});


// import { ApolloError } from '@apollo/client';
// import { screen } from '@testing-library/react';
// import { userEvent } from '@testing-library/user-event';
// import { GraphQLError } from 'graphql/error/GraphQLError';

// import { render } from '../../../tests/utils/rendering';
// import { TenantRemoveForm, TenantRemoveFormProps } from '../tenantDangerZone.component';

// describe('TenantRemoveForm: Component', () => {
//   const defaultProps: TenantRemoveFormProps = {
//     onSubmit: jest.fn(),
//     loading: false,
//   };

//   const Component = (props: Partial<TenantRemoveFormProps>) => <TenantRemoveForm {...defaultProps} {...props} />;

//   describe('action completes successfully', () => {
//     it('should call onSubmit prop', async () => {
//       const onSubmit = jest.fn();
//       render(<Component onSubmit={onSubmit} />);

//       const button = await screen.findByRole('button', { name: /remove organisation/i })
//       await userEvent.click(button);

//       expect(onSubmit).toHaveBeenCalled();
//     });
//   });

//   it('should show non field error if error', async () => {
//     render(<Component error={new ApolloError({ graphQLErrors: [new GraphQLError('Provided value is invalid')] })} />);

//     expect(await screen.findByText('Provided value is invalid')).toBeInTheDocument();
//   });
// });
