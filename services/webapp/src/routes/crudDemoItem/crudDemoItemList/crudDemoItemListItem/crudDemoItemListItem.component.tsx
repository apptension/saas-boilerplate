import { MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import graphql from 'babel-plugin-relay/macro';
import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { ConnectionHandler } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { usePromiseMutation } from '../../../../shared/services/graphqlApi/usePromiseMutation';
import { RoutesConfig } from '../../../../app/config/routes';
import { useMediaQuery } from '../../../../shared/hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';
import { Link } from '../../../../shared/components/link';
import { Button, ButtonVariant } from '../../../../shared/components/forms/button';
import { Icon } from '../../../../shared/components/icon';
import { useGenerateLocalePath } from '../../../../shared/hooks/localePaths';
import { crudDemoItemListItem$key } from './__generated__/crudDemoItemListItem.graphql';
import { Container, DropdownMenu, InlineButtons, LinkContainer, Text } from './crudDemoItemListItem.styles';

export type CrudDemoItemListItemProps = {
  item: crudDemoItemListItem$key;
};

export const CrudDemoItemListItem = ({ item }: CrudDemoItemListItemProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });
  const [commitDeleteMutation] = usePromiseMutation(
    graphql`
      mutation crudDemoItemListItemDeleteMutation($input: DeleteCrudDemoItemMutationInput!, $connections: [ID!]!) {
        deleteCrudDemoItem(input: $input) {
          deletedIds @deleteEdge(connections: $connections)
        }
      }
    `
  );

  const data = useFragment<crudDemoItemListItem$key>(
    graphql`
      fragment crudDemoItemListItem on CrudDemoItemType {
        id
        name
      }
    `,
    item
  );

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await commitDeleteMutation({
      variables: {
        input: { id: data.id },
        connections: [ConnectionHandler.getConnectionID('root', 'crudDemoItemList_allCrudDemoItems')],
      },
    });
  };

  const renderInlineButtons = () => (
    <InlineButtons>
      <Link
        variant={ButtonVariant.RAW}
        to={generateLocalePath(RoutesConfig.crudDemoItem.edit, { id: data.id })}
        icon={<Icon size={14} icon={editIcon} />}
      >
        <FormattedMessage id="CrudDemoItem list / Edit link" defaultMessage="Edit" />
      </Link>
      <Button variant={ButtonVariant.RAW} onClick={handleDelete} icon={<Icon size={14} icon={deleteIcon} />}>
        <FormattedMessage id="CrudDemoItem list / Delete button" defaultMessage="Delete" />
      </Button>
    </InlineButtons>
  );

  const renderButtonsMenu = () => <DropdownMenu itemId={data.id} />;

  return (
    <Container>
      <LinkContainer>
        <Link variant={ButtonVariant.RAW} to={generateLocalePath(RoutesConfig.crudDemoItem.details, { id: data.id })}>
          <Text>{data.name}</Text>
        </Link>
        {isDesktop ? renderInlineButtons() : renderButtonsMenu()}
      </LinkContainer>
    </Container>
  );
};
