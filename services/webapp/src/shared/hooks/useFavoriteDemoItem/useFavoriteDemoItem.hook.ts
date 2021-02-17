import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import { selectFavoriteDemoItemIds } from '../../../modules/demoItems/demoItems.selectors';
import { demoItemsActions } from '../../../modules/demoItems';

export const useFavoriteDemoItem = (id: string) => {
  const dispatch = useDispatch();
  const favorites = useSelector(selectFavoriteDemoItemIds);
  const isFavorite = useMemo(() => favorites.includes(id), [id, favorites]);
  const setFavorite = (isFavorite: boolean) => {
    dispatch(demoItemsActions.setFavorite({ isFavorite, id }));
  };

  return {
    isFavorite,
    setFavorite,
  };
};
