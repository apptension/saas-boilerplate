import { Routes, Route } from 'react-router-dom';
import { RoutesConfig } from '../../app/config/routes';
import { NotFound } from '../../app/asyncComponents';
import { CrudDemoItemList } from './crudDemoItemList';
import { CrudDemoItemDetails } from './crudDemoItemDetails';
import { AddCrudDemoItem } from './addCrudDemoItem';
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
