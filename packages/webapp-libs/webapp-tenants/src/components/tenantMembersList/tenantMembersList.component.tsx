import { useQuery } from '@apollo/client';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@sb/webapp-core/components/ui/table';
import { FormattedMessage } from 'react-intl';

import { useCurrentTenant } from '../../providers';
import { MembershipEntry } from './membershipEntry';
import { tenantMembersListQuery } from './tenantMembersList.graphql';

export const TenantMembersList = () => {
  const { data: currentTenant } = useCurrentTenant();
  const { data, refetch } = useQuery(tenantMembersListQuery, {
    fetchPolicy: 'cache-and-network',
    variables: {
      id: currentTenant?.id ?? '',
    },
    skip: !currentTenant,
  });

  const memberships = data?.tenant?.userMemberships?.filter((membership) => !!membership) ?? [];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <FormattedMessage defaultMessage="Username" id="Tenant members list / Username" />
          </TableHead>
          <TableHead>
            <FormattedMessage defaultMessage="Role" id="Tenant members list / Role" />
          </TableHead>
          <TableHead>
            <FormattedMessage defaultMessage="Invitation accepted" id="Tenant members list / Invitation accepted" />
          </TableHead>
          <TableHead>
            <FormattedMessage defaultMessage="Actions" id="Tenant members list / Actions" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {memberships.map(
          (membership) =>
            membership && <MembershipEntry membership={membership} key={membership.id} onAfterUpdate={refetch} />
        )}
      </TableBody>
    </Table>
  );
};
