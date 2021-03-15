import React, { useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { crudDemoItemActions } from '../../../modules/crudDemoItem';
import { selectCrudDemoItemList } from '../../../modules/crudDemoItem/crudDemoItem.selectors';
import { useLocaleUrl } from '../../useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../app.constants';
import { ButtonVariant } from '../../../shared/components/button/button.types';
import { AddNewLink, Container, Header, List } from './crudDemoItemList.styles';
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
      <Header>CRUD Example Items</Header>
      <AddNewLink to={addNewUrl} variant={ButtonVariant.PRIMARY}>
        <FormattedMessage description={'CrudDemoItemList / Add new'} defaultMessage={'Add new item'} />
      </AddNewLink>

      <List>
        {items.map((item) => (
          <CrudDemoItemListItem item={item} key={item.id} />
        ))}
      </List>
    </Container>
  );
};
