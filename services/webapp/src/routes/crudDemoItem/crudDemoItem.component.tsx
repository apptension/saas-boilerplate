import { Switch } from 'react-router-dom';
import { AuthRoute } from '../authRoute';
import { ROUTES } from '../app.constants';
import { CrudDemoItemList } from './crudDemoItemList';
import { CrudDemoItemDetails } from './crudDemoItemDetails';
import { AddCrudDemoItem } from './addCrudDemoItem';
import { EditCrudDemoItem } from './editCrudDemoItem';

export const CrudDemoItem = () => {
  return (
    <Switch>
      <AuthRoute exact path={ROUTES.crudDemoItem.list}>
        <CrudDemoItemList />
      </AuthRoute>
      <AuthRoute exact path={ROUTES.crudDemoItem.add}>
        <AddCrudDemoItem />
      </AuthRoute>
      <AuthRoute exact path={ROUTES.crudDemoItem.details}>
        <CrudDemoItemDetails />
      </AuthRoute>
      <AuthRoute exact path={ROUTES.crudDemoItem.edit}>
        <EditCrudDemoItem />
      </AuthRoute>
    </Switch>
  );
};
