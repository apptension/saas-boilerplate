import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../notification';
import { NotificationType } from '../../notifications.types';
import { RoutesConfig } from '../../../../../app/config/routes';
import { useGenerateLocalePath } from '../../../../hooks/localePaths';

export type CrudItemCreatedProps = NotificationType<{
  id: string;
  name: string;
  user: string;
  avatar: string | null;
}>;

export const CrudItemCreated = ({ data: { id, name, user, avatar }, ...restProps }: CrudItemCreatedProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();

  return (
    <Notification
      {...restProps}
      onClick={() => {
        const route = generateLocalePath(RoutesConfig.crudDemoItem.details, { id });
        navigate(route);
      }}
      avatar={avatar}
      title={user}
      content={
        <FormattedMessage
          defaultMessage={'CRUD item "{name}" has been created'}
          id="Notifications / CrudItemCreated / Content"
          values={{ name }}
        />
      }
    />
  );
};
