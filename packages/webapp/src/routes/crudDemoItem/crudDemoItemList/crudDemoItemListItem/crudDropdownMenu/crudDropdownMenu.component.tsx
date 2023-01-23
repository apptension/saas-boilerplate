import { useState, MouseEvent } from 'react';
import graphql from 'babel-plugin-relay/macro';
import { ConnectionHandler } from 'relay-runtime';
import { FormattedMessage, useIntl } from 'react-intl';
import ClickAwayListener from 'react-click-away-listener';
import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { usePromiseMutation } from '../../../../../shared/services/graphqlApi/usePromiseMutation';
import { Link as ButtonLink } from '../../../../../shared/components/link';
import { Button, ButtonVariant } from '../../../../../shared/components/forms/button';
import { Icon } from '../../../../../shared/components/icon';
import { RoutesConfig } from '../../../../../app/config/routes';
import { useGenerateLocalePath } from '../../../../../shared/hooks/localePaths';
import { Container, Menu, ToggleButton, ToggleButtonCircle } from './crudDropdownMenu.styles';

export type CrudDropdownMenuProps = {
  itemId: string;
  className?: string;
};

export const CrudDropdownMenu = ({ itemId, className }: CrudDropdownMenuProps) => {
  const [isOpen, setOpen] = useState(false);
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const [commitDeleteMutation] = usePromiseMutation(
    graphql`
      mutation crudDropdownMenuItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!, $connections: [ID!]!) {
        deleteCrudDemoItem(input: $input) {
          deletedIds @deleteEdge(connections: $connections)
        }
      }
    `
  );

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await commitDeleteMutation({
      variables: {
        input: { id: itemId },
        connections: [ConnectionHandler.getConnectionID('root', 'crudDemoItemListContent_allCrudDemoItems')],
      },
    });
  };

  return (
    <Container className={className}>
      <ToggleButton
        onClick={(e) => {
          e.preventDefault();
          setOpen((isOpen) => !isOpen);
        }}
        aria-label={intl.formatMessage({
          defaultMessage: 'Open item actions',
          id: 'CrudDemoItemList.Open item actions',
        })}
        aria-expanded={isOpen}
      >
        <ToggleButtonCircle />
        <ToggleButtonCircle />
        <ToggleButtonCircle />
      </ToggleButton>

      <ClickAwayListener
        onClickAway={(e) => {
          if (isOpen) {
            setOpen(false);
            e.preventDefault();
          }
        }}
      >
        <Menu isOpen={isOpen}>
          <ButtonLink
            variant={ButtonVariant.FLAT}
            to={generateLocalePath(RoutesConfig.crudDemoItem.edit, { id: itemId })}
            icon={<Icon size={14} icon={editIcon} />}
          >
            <FormattedMessage id="CrudDemoItem list / Edit link" defaultMessage="Edit" />
          </ButtonLink>
          <Button variant={ButtonVariant.FLAT} onClick={handleDelete} icon={<Icon size={14} icon={deleteIcon} />}>
            <FormattedMessage id="CrudDemoItem list / Delete button" defaultMessage="Delete" />
          </Button>
        </Menu>
      </ClickAwayListener>
    </Container>
  );
};
