import { TenantUserRole } from '@sb/webapp-api-client';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { composeMockedQueryResult } from '@sb/webapp-api-client/tests/utils';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { tenantMembersListQuery } from '../../../../../components/tenantMembersList/tenantMembersList.graphql';
import { tenantFactory } from '../../../../../tests/factories/tenant';
import { render } from '../../../../../tests/utils/rendering';
import { createTenantInvitation } from '../invitationForm.graphql';
import { InvitationForm } from '../invotationForm.component';

jest.mock('@sb/webapp-core/services/analytics');

describe('InvitationForm: Component', () => {
  const Component = () => <InvitationForm />;

  it('should display empty form', async () => {
    const { waitForApolloMocks } = render(<Component />);
    await waitForApolloMocks();
    const emailValue = (await screen.findByLabelText(/email/i)).getAttribute('value');
    expect(emailValue).toBe('');

    const roleValue = (await screen.findByLabelText(/role/i)).getAttribute('value');
    expect(roleValue).toBe(null);
  });

  describe('action completes successfully', () => {
    it('should commit mutation', async () => {
      const tenants = [tenantFactory({ membership: { role: TenantUserRole.MEMBER } })];
      const currentUser = currentUserFactory({ tenants });

      const emailValue = 'example@example.com';
      const roleValue = TenantUserRole.MEMBER;

      const variables = {
        input: {
          email: emailValue,
          role: roleValue,
          tenantId: tenants[0].id,
        },
      };

      const data = {
        createTenantInvitation: {
          email: emailValue,
          role: roleValue,
        },
      };
      const requestMock = composeMockedQueryResult(createTenantInvitation, {
        variables,
        data,
      });

      const refetchData = {
        tenant: {
          userMemberships: [],
        },
      };

      const refetchMock = composeMockedQueryResult(tenantMembersListQuery, {
        data: refetchData,
        variables: {
          id: tenants[0].id,
        },
      });

      requestMock.newData = jest.fn(() => ({
        data,
      }));

      refetchMock.newData = jest.fn(() => ({
        data: refetchData,
      }));

      const apolloMocks = [fillCommonQueryWithUser(currentUser), requestMock, refetchMock];

      const { waitForApolloMocks } = render(<Component />, { apolloMocks });

      await waitForApolloMocks(0);

      await userEvent.type(await screen.findByLabelText(/email/i), emailValue);
      expect(await screen.findByText('Member')).toBeInTheDocument();
      await userEvent.selectOptions(screen.getByRole('combobox', { name: '', hidden: true }), TenantUserRole.MEMBER);
      await userEvent.click(screen.getByRole('button', { name: 'Invite' }));

      expect(requestMock.newData).toHaveBeenCalled();
      expect(refetchMock.newData).toHaveBeenCalled();

      const toast = await screen.findByTestId('toast-1');

      expect(trackEvent).toHaveBeenCalledWith('tenantInvitation', 'invite', tenants[0].id);
      expect(toast).toHaveTextContent('🎉 User invited successfully!');
    });
  });
});
