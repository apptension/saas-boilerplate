import { MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';
import { useMutation } from '@apollo/client';
import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';

import { RoutesConfig } from '../../../../app/config/routes';
import { useMediaQuery } from '../../../../shared/hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';
import { Link } from '../../../../shared/components/link';
import { Button, ButtonVariant } from '../../../../shared/components/forms/button';
import { Icon } from '../../../../shared/components/icon';
import { useGenerateLocalePath } from '../../../../shared/hooks/localePaths';
import { FragmentType, useFragment } from '../../../../shared/services/graphqlApi/__generated/gql';

import { Container, DropdownMenu, InlineButtons, LinkContainer, Text } from './crudDemoItemListItem.styles';
import { crudDemoItemListItemDeleteMutation, crudDemoItemListItemFragment } from './crudDemoItemListItem.graphql';

export type CrudDemoItemListItemProps = {
  item: FragmentType<typeof crudDemoItemListItemFragment>;
};

export const CrudDemoItemListItem = ({ item }: CrudDemoItemListItemProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });
  const [commitDeleteMutation, { loading }] = useMutation(crudDemoItemListItemDeleteMutation, {
    update(cache, { data }) {
      cache.modify({
        fields: {
          allCrudDemoItems(existingConnection = { edges: [] }) {
            const deletedId = data?.deleteCrudDemoItem?.deletedIds?.[0];
            if (!deletedId) return existingConnection;

            const normalizedId = cache.identify({ id: deletedId, __typename: 'CrudDemoItemType' });
            return {
              ...existingConnection,
              edges: existingConnection.edges.filter(({ node }) => node.__ref !== normalizedId),
            };
          },
        },
      });
    },
  });

  const data = useFragment(crudDemoItemListItemFragment, item);

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    commitDeleteMutation({
      variables: {
        input: { id: data.id },
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
      <Button
        variant={ButtonVariant.RAW}
        onClick={handleDelete}
        disabled={loading}
        icon={<Icon size={14} icon={deleteIcon} />}
      >
        <FormattedMessage id="CrudDemoItem list / Delete button" defaultMessage="Delete" />
      </Button>
    </InlineButtons>
  );

  const renderButtonsMenu = () => <DropdownMenu itemId={data.id} handleDelete={handleDelete} loading={loading} />;

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
