import React from 'react';

import { generatePath, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { CrudDemoItem } from '../../../../shared/services/api/crudDemoItem/types';
import { ROUTES } from '../../../app.constants';
import { crudDemoItemActions } from '../../../../modules/crudDemoItem';
import { useLocaleUrl } from '../../../useLanguageFromParams/useLanguageFromParams.hook';
import { Container } from './crudDemoItemListItem.styles';

export interface CrudDemoItemListItemProps {
  item: CrudDemoItem;
}

export const CrudDemoItemListItem = ({ item }: CrudDemoItemListItemProps) => {
  const dispatch = useDispatch();
  const detailsUrl = useLocaleUrl(ROUTES.crudDemoItem.details);
  const editUrl = useLocaleUrl(ROUTES.crudDemoItem.edit);

  const handleDelete = () => {
    dispatch(crudDemoItemActions.deleteCrudDemoItem(item.id));
  };

  return (
    <Container>
      <Link to={generatePath(detailsUrl, { id: item.id })}>{item.name}</Link>
      <Link to={generatePath(editUrl, { id: item.id })}>
        [<FormattedMessage description={'CrudDemoItem list / edit link'} defaultMessage={'Edit'} />]
      </Link>
      <button onClick={handleDelete}>
        <FormattedMessage description={'CrudDemoItem list / delete button'} defaultMessage={'Delete'} />
      </button>
    </Container>
  );
};
