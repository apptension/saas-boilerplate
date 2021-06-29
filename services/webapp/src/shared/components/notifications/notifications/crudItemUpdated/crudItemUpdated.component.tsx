import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Notification } from '../../notification';
import { NotificationType } from '../../notifications.types';
import { ROUTES } from '../../../../../routes/app.constants';
import { useGenerateLocalePath } from '../../../../../routes/useLanguageFromParams/useLanguageFromParams.hook';

export type CrudItemUpdatedProps = NotificationType<{
  id: string;
  name: string;
  user: string;
}>;

export const CrudItemUpdated = ({ data: { id, name, user }, ...restProps }: CrudItemUpdatedProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const history = useHistory();

  return (
    <Notification
      {...restProps}
      onClick={() => {
        const route = generateLocalePath(ROUTES.crudDemoItem.details, { id });
        history.push(route);
      }}
      title={user}
      content={
        <FormattedMessage
          defaultMessage={'CRUD item "{name}" has been updated'}
          description="Notifications / CrudItemUpdated / Content"
          values={{ name }}
        />
      }
    />
  );
};
