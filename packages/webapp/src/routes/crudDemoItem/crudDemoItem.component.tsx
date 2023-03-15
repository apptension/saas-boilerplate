import { Route, Routes } from 'react-router-dom';

import { NotFound } from '../../app/asyncComponents';
import { RoutesConfig } from '../../app/config/routes';
import { AddCrudDemoItem } from './addCrudDemoItem';
import { CrudDemoItemDetails } from './crudDemoItemDetails';
import { CrudDemoItemList } from './crudDemoItemList';
import { EditCrudDemoItem } from './editCrudDemoItem';

export const CrudDemoItem = () => {
  return (
    <Routes>
      <Route index element={<CrudDemoItemList />} />
      <Route path={RoutesConfig.crudDemoItem.getRelativeUrl('add')} element={<AddCrudDemoItem />} />
      <Route path={RoutesConfig.crudDemoItem.getRelativeUrl('details')} element={<CrudDemoItemDetails />} />
      <Route path={RoutesConfig.crudDemoItem.getRelativeUrl('edit')} element={<EditCrudDemoItem />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
