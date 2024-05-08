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
    <div className="mt-6">
      <Button onClick={onSubmit} disabled={loading} variant="destructive" >
        <FormattedMessage defaultMessage="Remove organisation" id="Tenant Danger Settings / Remove tenant button" />
      </Button>
      {error && <span className="absolute text-red-500">{error.message}</span>}
    </div>

  );
};
