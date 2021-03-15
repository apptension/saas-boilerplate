import React from 'react';

import { generatePath } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import editIcon from '@iconify-icons/ion/pencil-sharp';
import deleteIcon from '@iconify-icons/ion/trash-outline';
import { CrudDemoItem } from '../../../../shared/services/api/crudDemoItem/types';
import { ROUTES } from '../../../app.constants';
import { crudDemoItemActions } from '../../../../modules/crudDemoItem';
import { useLocaleUrl } from '../../../useLanguageFromParams/useLanguageFromParams.hook';
import { useMediaQuery } from '../../../../shared/hooks/useMediaQuery';
import { Breakpoint } from '../../../../theme/media';
import { Link } from '../../../../shared/components/link';
import { Button } from '../../../../shared/components/button';
import { Icon } from '../../../../shared/components/icon';
import { ButtonVariant } from '../../../../shared/components/button/button.types';
import { Container, InlineButtons, LinkContainer, Text, DropdownMenu } from './crudDemoItemListItem.styles';

export interface CrudDemoItemListItemProps {
  item: CrudDemoItem;
}

export const CrudDemoItemListItem = ({ item }: CrudDemoItemListItemProps) => {
  const dispatch = useDispatch();
  const detailsUrl = useLocaleUrl(ROUTES.crudDemoItem.details);
  const editUrl = useLocaleUrl(ROUTES.crudDemoItem.edit);
  const { matches: isDesktop } = useMediaQuery({ above: Breakpoint.TABLET });

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dispatch(crudDemoItemActions.deleteCrudDemoItem(item.id));
  };

  const renderInlineButtons = () => (
    <InlineButtons>
      <Link
        variant={ButtonVariant.RAW}
        to={generatePath(editUrl, { id: item.id })}
        icon={<Icon size={14} icon={editIcon} />}
      >
        <FormattedMessage description={'CrudDemoItem list / Edit link'} defaultMessage={'Edit'} />
      </Link>
      <Button variant={ButtonVariant.RAW} onClick={handleDelete} icon={<Icon size={14} icon={deleteIcon} />}>
        <FormattedMessage description={'CrudDemoItem list / Delete button'} defaultMessage={'Delete'} />
      </Button>
    </InlineButtons>
  );

  const renderButtonsMenu = () => <DropdownMenu itemId={item.id} />;

  return (
    <Container>
      <LinkContainer to={generatePath(detailsUrl, { id: item.id })}>
        <Text>{item.name}</Text>
        {isDesktop ? renderInlineButtons() : renderButtonsMenu()}
      </LinkContainer>
    </Container>
  );
};
