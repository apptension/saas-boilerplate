import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FC } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';
import { AddCrudDemoItem } from './addCrudDemoItem';
import { CrudDemoItemDetails } from './crudDemoItemDetails';
import { CrudDemoItemList } from './crudDemoItemList';
import { EditCrudDemoItem } from './editCrudDemoItem';

type CrudDemoItemProps = {
  routesConfig: {
    notFound: string;
  };
};

export const CrudDemoItem: FC<CrudDemoItemProps> = ({ routesConfig }) => {
  const generateLocalePath = useGenerateLocalePath();
  return (
    <Routes>
      <Route index element={<CrudDemoItemList />} />
      <Route path={RoutesConfig.crudDemoItem.getRelativeUrl('add')} element={<AddCrudDemoItem />} />
      <Route path={RoutesConfig.crudDemoItem.getRelativeUrl('details')} element={<CrudDemoItemDetails />} />
      <Route path={RoutesConfig.crudDemoItem.getRelativeUrl('edit')} element={<EditCrudDemoItem />} />
      <Route path="*" element={<Navigate to={generateLocalePath(routesConfig.notFound)} />} />
    </Routes>
  );
};
