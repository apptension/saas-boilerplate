import { ApolloError } from '@apollo/client';
import { Button } from '@sb/webapp-core/components/buttons';
import { FormattedMessage } from 'react-intl';


export type TenantFormFields = {
  name: string;
};

export type TenantRemoveFormProps = {
  onSubmit: () => void;
  loading: boolean;
  error?: ApolloError;
};

export const TenantRemoveForm = ({ onSubmit, error, loading }: TenantRemoveFormProps) => {
  return (
    <div>
      <Button onClick={onSubmit} disabled={loading} variant="destructive" >
        <FormattedMessage defaultMessage="Remove organisation" id="Tenant Danger Settings / Remove tenant button" />
      </Button>


      {!!error && <p className="text-red-500">{error.graphQLErrors[0]?.message}</p>}
    </div>
  )


};
