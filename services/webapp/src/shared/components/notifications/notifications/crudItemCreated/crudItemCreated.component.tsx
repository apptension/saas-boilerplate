import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { Notification } from '../../notification';
import { NotificationType } from '../../notifications.types';
import { useGenerateLocalePath } from '../../../../../routes/useLanguageFromParams/useLanguageFromParams.hook';
import { ROUTES } from '../../../../../routes/app.constants';

export type CrudItemCreatedProps = NotificationType<{
  id: string;
  name: string;
  user: string;
}>;

export const CrudItemCreated = ({ data: { id, name, user }, ...restProps }: CrudItemCreatedProps) => {
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
          defaultMessage={'CRUD item "{name}" has been created'}
          description="Notifications / CrudItemCreated / Content"
          values={{ name }}
        />
      }
    />
  );
};
