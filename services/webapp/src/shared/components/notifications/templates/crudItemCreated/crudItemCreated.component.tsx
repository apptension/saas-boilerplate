import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Notification } from '../../notification';
import { NotificationType } from '../../notifications.types';
import { ROUTES } from '../../../../../app/config/routes';
import { useGenerateLocalePath } from '../../../../hooks/localePaths';

export type CrudItemCreatedProps = NotificationType<{
  id: string;
  name: string;
  user: string;
  avatar: string | null;
}>;

export const CrudItemCreated = ({ data: { id, name, user, avatar }, ...restProps }: CrudItemCreatedProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const history = useHistory();

  return (
    <Notification
      {...restProps}
      onClick={() => {
        const route = generateLocalePath(ROUTES.crudDemoItem.details, { id });
        history.push(route);
      }}
      avatar={avatar}
      title={user}
      content={
        <FormattedMessage
          defaultMessage={'CRUD item "{name}" has been created'}
          description="Notifications / CrudItemCreated / Content"
          values={{ name }}
        />
      }
    />
  );
};
