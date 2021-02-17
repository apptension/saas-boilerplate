import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { crudDemoItemActions } from '../../../modules/crudDemoItem';
import { selectCrudDemoItemList } from '../../../modules/crudDemoItem/crudDemoItem.selectors';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { Container } from './crudDemoItemList.styles';
import { CrudDemoItemListItem } from './crudDemoItemListItem';

export const CrudDemoItemList = () => {
  const dispatch = useDispatch();
  const addNewUrl = useLocaleUrl(ROUTES.crudDemoItem.add);
  useEffect(() => {
    dispatch(crudDemoItemActions.fetchCrudDemoItemList());
  }, [dispatch]);

  const items = useSelector(selectCrudDemoItemList);

  return (
    <Container>
      <h1>CrudDemoItemList component</h1>
      <Link to={addNewUrl}>
        <FormattedMessage description={'CrudDemoItemList / Add new'} defaultMessage={'Add new'} />
      </Link>

      {items.map((item) => (
        <CrudDemoItemListItem item={item} key={item.id} />
      ))}
    </Container>
  );
};
