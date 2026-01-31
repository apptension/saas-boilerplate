import { Button } from '@sb/webapp-core/components/buttons';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { useGenerateTenantPath } from '../../hooks/useGenerateTenantPath';
import { RoutesConfig } from '../../config/routes';

export const AccessDenied = () => {
  const navigate = useNavigate();
  const generateTenantPath = useGenerateTenantPath();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate(generateTenantPath(RoutesConfig.home));
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
          <ShieldX className="h-12 w-12 text-destructive" />
        </div>
      </div>

      <h1 className="mb-4 text-3xl font-bold tracking-tight text-foreground">
        <FormattedMessage defaultMessage="Access Denied" id="Access Denied / Title" />
      </h1>

      <p className="mb-2 max-w-md text-lg text-muted-foreground">
        <FormattedMessage
          defaultMessage="You don't have permission to access this page."
          id="Access Denied / Description"
        />
      </p>

      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        <FormattedMessage
          defaultMessage="If you believe this is an error, please contact your organization administrator to request access."
          id="Access Denied / Contact Admin"
        />
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="outline" onClick={handleGoBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <FormattedMessage defaultMessage="Go Back" id="Access Denied / Go Back Button" />
        </Button>

        <Button onClick={handleGoHome} className="gap-2">
          <Home className="h-4 w-4" />
          <FormattedMessage defaultMessage="Go to Home" id="Access Denied / Go Home Button" />
        </Button>
      </div>
    </div>
  );
};
