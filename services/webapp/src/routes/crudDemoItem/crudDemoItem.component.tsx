import { Routes as RouterRoutes, Route } from 'react-router-dom';
import { Routes } from '../../app/config/routes';
import { NotFound } from '../../app/asyncComponents';
import { CrudDemoItemList } from './crudDemoItemList';
import { CrudDemoItemDetails } from './crudDemoItemDetails';
import { AddCrudDemoItem } from './addCrudDemoItem';
import { EditCrudDemoItem } from './editCrudDemoItem';

export const CrudDemoItem = () => {
  return (
    <RouterRoutes>
      <Route index element={<CrudDemoItemList />} />
      <Route path={Routes.crudDemoItem.getRelativeUrl('add')} element={<AddCrudDemoItem />} />
      <Route path={Routes.crudDemoItem.getRelativeUrl('details')} element={<CrudDemoItemDetails />} />
      <Route path={Routes.crudDemoItem.getRelativeUrl('edit')} element={<EditCrudDemoItem />} />
      <Route path="*" element={<NotFound />} />
    </RouterRoutes>
  );
};
