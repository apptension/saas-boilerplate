import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../../../../app/config/routes';
import { Notification } from '../../notification';
import { NotificationType } from '../../notifications.types';

export type CrudItemUpdatedProps = NotificationType<{
  id: string;
  name: string;
  user: string;
  avatar: string | null;
}>;

export const CrudItemUpdated = ({ data: { id, name, user, avatar }, ...restProps }: CrudItemUpdatedProps) => {
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
          defaultMessage={'CRUD item "{name}" has been updated'}
          id="Notifications / CrudItemUpdated / Content"
          values={{ name }}
        />
      }
    />
  );
};
