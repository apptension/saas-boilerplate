import { useMutation } from '@apollo/client';
import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { FragmentType, getFragmentData } from '@sb/webapp-api-client/graphql';
import { Button, ButtonVariant, Link } from '@sb/webapp-core/components/buttons';
import { Icon } from '@sb/webapp-core/components/icons';
import { useGenerateLocalePath, useMediaQuery } from '@sb/webapp-core/hooks';
import { trackEvent } from '@sb/webapp-core/services/analytics';
import { media } from '@sb/webapp-core/theme';
import { MouseEvent } from 'react';
import { FormattedMessage } from 'react-intl';

import { RoutesConfig } from '../../../../config/routes';
import { crudDemoItemListItemDeleteMutation, crudDemoItemListItemFragment } from './crudDemoItemListItem.graphql';
import { Container, DropdownMenu, InlineButtons, LinkContainer, Text } from './crudDemoItemListItem.styles';

export type CrudDemoItemListItemProps = {
  item: FragmentType<typeof crudDemoItemListItemFragment>;
};

export const CrudDemoItemListItem = ({ item }: CrudDemoItemListItemProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const { matches: isDesktop } = useMediaQuery({ above: media.Breakpoint.TABLET });
  const [commitDeleteMutation, { loading }] = useMutation(crudDemoItemListItemDeleteMutation, {
    update(cache, { data }) {
      data?.deleteCrudDemoItem?.deletedIds?.forEach((deletedId) => {
        const normalizedId = cache.identify({ id: deletedId, __typename: 'CrudDemoItemType' });
        cache.evict({ id: normalizedId });
      });
      cache.gc();
    },
    onCompleted: (data) => {
      const ids = data?.deleteCrudDemoItem?.deletedIds;
      trackEvent('crud', 'delete', ids?.join(', '));
    },
  });

  const data = getFragmentData(crudDemoItemListItemFragment, item);

  const handleDelete = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    commitDeleteMutation({
      variables: {
        input: { id: data.id },
      },
    });
  };

  const renderInlineButtons = () => (
    <InlineButtons className="flex">
      <Link
        variant={ButtonVariant.GHOST}
        className="flex h-10 w-full items-center justify-between rounded-md border 
        border-input bg-transparent px-3 py-2 text-sm ring-offset-background 
        placeholder:text-muted-foreground focus:outline-none focus:ring-2 
        focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed 
        disabled:opacity-50 hover:bg-accent hover:text-accent-foreground"
        to={generateLocalePath(RoutesConfig.crudDemoItem.edit, { id: data.id })}
        icon={<Icon size={14} icon={editIcon} />}
      >
        <FormattedMessage id="CrudDemoItem list / Edit link" defaultMessage="Edit" />
      </Link>
      <Button
        variant={ButtonVariant.GHOST}
        onClick={handleDelete}
        disabled={loading}
        icon={<Icon size={14} icon={deleteIcon} />}
        className="flex h-10 w-full items-center justify-between rounded-md border 
        border-input bg-transparent px-3 py-2 text-sm ring-offset-background 
        placeholder:text-muted-foreground focus:outline-none focus:ring-2 
        focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed 
        disabled:opacity-50"
      >
        <FormattedMessage id="CrudDemoItem list / Delete button" defaultMessage="Delete" />
      </Button>
    </InlineButtons>
  );

  const renderButtonsMenu = () => <DropdownMenu itemId={data.id} handleDelete={handleDelete} loading={loading} />;

  return (
    <Container>
      <LinkContainer>
        <Link variant={ButtonVariant.GHOST} to={generateLocalePath(RoutesConfig.crudDemoItem.details, { id: data.id })}>
          <Text>{data.name}</Text>
        </Link>
        {isDesktop ? renderInlineButtons() : renderButtonsMenu()}
      </LinkContainer>
    </Container>
  );
};
