import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { Notification, NotificationType } from '@sb/webapp-notifications';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { RoutesConfig } from '../../config/routes';

export type CrudItemCreatedProps = NotificationType<{
  id: string;
  name: string;
}>;

export const CrudItemCreated = ({ data: { id, name }, issuer, ...restProps }: CrudItemCreatedProps) => {
  const generateLocalePath = useGenerateLocalePath();
  const navigate = useNavigate();

  return (
    <Notification
      {...restProps}
      onClick={() => {
        const route = generateLocalePath(RoutesConfig.crudDemoItem.details, { id });
        navigate(route);
      }}
      avatar={issuer?.avatar}
      title={issuer?.email}
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
