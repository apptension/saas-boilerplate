import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { propEq } from 'ramda';
import { selectCrudDemoItemList } from '../../../modules/crudDemoItem/crudDemoItem.selectors';
import { crudDemoItemActions } from '../../../modules/crudDemoItem';

export const useCrudDemoItem = (id: string) => {
  const dispatch = useDispatch();
  const allItems = useSelector(selectCrudDemoItemList);
  const itemData = useMemo(() => allItems.find(propEq('id', id)), [allItems, id]);

  useEffect(() => {
    if (!itemData) {
      dispatch(crudDemoItemActions.fetchCrudDemoItem(id));
    }
  }, [dispatch, id, itemData]);

  return itemData;
};
