import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button } from '../button';
import { Container } from './users.styles';
import { useUsers } from './useUsers.hook';

export const Users = () => {
  const [users, fetchUsers] = useUsers();

  return (
    <Container>
      <Button onClick={fetchUsers}>
        <FormattedMessage defaultMessage="Fetch users" description="Users / fetch button" />
      </Button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name} [{user.displayName}]</li>
        ))}
      </ul>
    </Container>
  );
};
