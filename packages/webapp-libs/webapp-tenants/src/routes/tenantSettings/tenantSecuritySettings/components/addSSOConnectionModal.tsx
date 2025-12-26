import { useState } from 'react';
import { apiClient } from '@sb/webapp-api-client/api';
import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Label } from '@sb/webapp-core/components/ui/label';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Shield, Key, Building2, ArrowLeft, Link2, CheckCircle2, Loader2 } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

type SSOType = 'saml' | 'oidc' | null;
type Step = 'select' | 'configure' | 'success';

export type AddSSOConnectionModalProps = {
  closeModal: () => void;
  onSuccess?: () => void;
  tenantId: string;
};

export const AddSSOConnectionModal = ({ closeModal, onSuccess, tenantId }: AddSSOConnectionModalProps) => {
  const intl = useIntl();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('select');
  const [ssoType, setSsoType] = useState<SSOType>(null);
  const [loading, setLoading] = useState(false);
  const [spMetadataUrl, setSpMetadataUrl] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [oidcCallbackUrl, setOidcCallbackUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    // SAML fields
    entityId: '',
    ssoUrl: '',
    certificate: '',
    // OIDC fields
    issuer: '',
    clientId: '',
    clientSecret: '',
  });

  const handleSSOTypeSelect = (type: SSOType) => {
    setSsoType(type);
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select');
      setSsoType(null);
    }
  };

  const handleSubmit = async () => {
    if (!ssoType) return;

    setLoading(true);

    const body = ssoType === 'saml' 
      ? {
          name: formData.name,
          connectionType: 'saml',
          samlEntityId: formData.entityId,
          samlSsoUrl: formData.ssoUrl,
          samlCertificate: formData.certificate,
        }
      : {
          name: formData.name,
          connectionType: 'oidc',
          oidcIssuer: formData.issuer,
          oidcClientId: formData.clientId,
          oidcClientSecret: formData.clientSecret,
        };

    try {
      const response = await apiClient.post(`/api/sso/tenant/${tenantId}/connections/`, body);

      const data = response.data;
      
      if (data.id) {
        setConnectionId(data.id);
      }
      if (data.spMetadataUrl) {
        setSpMetadataUrl(data.spMetadataUrl);
      }
      if (data.oidcCallbackUrl) {
        setOidcCallbackUrl(data.oidcCallbackUrl);
      }
      
      setStep('success');
      toast({
        description: intl.formatMessage({
          defaultMessage: 'SSO connection created successfully!',
          id: 'Add SSO Modal / Success Toast',
        }),
        variant: 'success',
      });
      onSuccess?.();

    } catch (error) {
      toast({
        description: error instanceof Error ? error.message : intl.formatMessage({
          defaultMessage: 'Failed to create SSO connection.',
          id: 'Add SSO Modal / Error Toast',
        }),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    if (ssoType === 'saml') {
      return formData.entityId.trim() && formData.ssoUrl.trim() && formData.certificate.trim();
    }
    if (ssoType === 'oidc') {
      return formData.issuer.trim() && formData.clientId.trim() && formData.clientSecret.trim();
    }
    return false;
  };

  return (
    <form 
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} 
      className="-m-6 flex h-[85vh] max-h-[700px] flex-col overflow-hidden"
    >
      {/* Fixed Header */}
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-6 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div className="mr-8">
          <h2 className="text-lg font-semibold">
            {step === 'success' ? (
              <FormattedMessage
                defaultMessage="Connection Created"
                id="Add SSO Modal / Title Success"
              />
            ) : ssoType ? (
              <FormattedMessage
                defaultMessage="Configure {type} Connection"
                id="Add SSO Modal / Title Config"
                values={{ type: ssoType.toUpperCase() }}
              />
            ) : (
              <FormattedMessage
                defaultMessage="Add SSO Connection"
                id="Add SSO Modal / Title"
              />
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            {step === 'success' ? (
              <FormattedMessage
                defaultMessage="Complete the setup in your identity provider"
                id="Add SSO Modal / Subtitle Success"
              />
            ) : ssoType ? (
              <FormattedMessage
                defaultMessage="Enter your identity provider details"
                id="Add SSO Modal / Subtitle Config"
              />
            ) : (
              <FormattedMessage
                defaultMessage="Choose your SSO protocol to get started"
                id="Add SSO Modal / Subtitle"
              />
            )}
          </p>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        {step === 'select' && (
          <div className="space-y-4">
            {/* Protocol Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleSSOTypeSelect('saml')}
                className="flex flex-col items-center gap-4 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">SAML 2.0</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <FormattedMessage
                      defaultMessage="Enterprise standard protocol"
                      id="Add SSO Modal / SAML Description"
                    />
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Okta</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Azure AD</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">OneLogin</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSSOTypeSelect('oidc')}
                className="flex flex-col items-center gap-4 p-6 border-2 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Key className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">OpenID Connect</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <FormattedMessage
                      defaultMessage="Modern OAuth 2.0 extension"
                      id="Add SSO Modal / OIDC Description"
                    />
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Google</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Auth0</span>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">Keycloak</span>
                </div>
              </button>
            </div>

            {/* Info box */}
            <div className="rounded-lg border bg-muted/30 p-4 mt-6">
              <div className="flex gap-3">
                <Link2 className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">
                    <FormattedMessage
                      defaultMessage="Not sure which to choose?"
                      id="Add SSO Modal / Help Title"
                    />
                  </p>
                  <FormattedMessage
                    defaultMessage="SAML 2.0 is recommended for enterprise IdPs like Okta and Azure AD. OIDC is simpler and works well with Google Workspace and modern identity providers."
                    id="Add SSO Modal / Help Description"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'configure' && ssoType === 'saml' && (
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                1
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-medium">
                  <FormattedMessage defaultMessage="Connection Details" id="Add SSO Modal / Step 1 Title" />
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="sso-name">
                    <FormattedMessage defaultMessage="Connection Name" id="SSO Form / Name Label" />
                  </Label>
                  <Input
                    id="sso-name"
                    placeholder={intl.formatMessage({
                      defaultMessage: 'e.g., Okta Production',
                      id: 'SSO Form / Name Placeholder',
                    })}
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                2
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-medium">
                  <FormattedMessage defaultMessage="Identity Provider Settings" id="Add SSO Modal / Step 2 Title" />
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="entity-id">
                      <FormattedMessage defaultMessage="IdP Entity ID / Issuer" id="SSO Form / Entity ID Label" />
                    </Label>
                    <Input
                      id="entity-id"
                      placeholder="https://idp.example.com/saml/metadata"
                      value={formData.entityId}
                      onChange={(e) => updateFormData('entityId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sso-url">
                      <FormattedMessage defaultMessage="SSO URL (Login URL)" id="SSO Form / SSO URL Label" />
                    </Label>
                    <Input
                      id="sso-url"
                      placeholder="https://idp.example.com/saml/sso"
                      value={formData.ssoUrl}
                      onChange={(e) => updateFormData('ssoUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificate">
                      <FormattedMessage defaultMessage="X.509 Certificate" id="SSO Form / Certificate Label" />
                    </Label>
                    <textarea
                      id="certificate"
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono text-xs"
                      placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDXTCCAkWgAwIBAgIJANI..."
                      value={formData.certificate}
                      onChange={(e) => updateFormData('certificate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SP Metadata Info */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    <FormattedMessage
                      defaultMessage="Service Provider Metadata"
                      id="Add SSO Modal / SP Metadata Title"
                    />
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <FormattedMessage
                      defaultMessage="After creating the connection, you'll receive the SP metadata URL to configure in your IdP."
                      id="Add SSO Modal / SP Metadata Description"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'configure' && ssoType === 'oidc' && (
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                1
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-medium">
                  <FormattedMessage defaultMessage="Connection Details" id="Add SSO Modal / OIDC Step 1 Title" />
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="oidc-name">
                    <FormattedMessage defaultMessage="Connection Name" id="OIDC Form / Name Label" />
                  </Label>
                  <Input
                    id="oidc-name"
                    placeholder={intl.formatMessage({
                      defaultMessage: 'e.g., Google Workspace',
                      id: 'OIDC Form / Name Placeholder',
                    })}
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                2
              </div>
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-medium">
                  <FormattedMessage defaultMessage="OAuth 2.0 / OIDC Settings" id="Add SSO Modal / OIDC Step 2 Title" />
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="issuer">
                      <FormattedMessage defaultMessage="Issuer URL / Discovery URL" id="OIDC Form / Issuer Label" />
                    </Label>
                    <Input
                      id="issuer"
                      placeholder="https://your-tenant.us.auth0.com/"
                      value={formData.issuer}
                      onChange={(e) => updateFormData('issuer', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-id">
                      <FormattedMessage defaultMessage="Client ID" id="OIDC Form / Client ID Label" />
                    </Label>
                    <Input
                      id="client-id"
                      placeholder="your-client-id.apps.googleusercontent.com"
                      value={formData.clientId}
                      onChange={(e) => updateFormData('clientId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client-secret">
                      <FormattedMessage defaultMessage="Client Secret" id="OIDC Form / Client Secret Label" />
                    </Label>
                    <Input
                      id="client-secret"
                      type="password"
                      placeholder="••••••••••••••••"
                      value={formData.clientSecret}
                      onChange={(e) => updateFormData('clientSecret', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Redirect URI Info */}
            <div className="rounded-lg border bg-blue-50 dark:bg-blue-950/20 p-4">
              <div className="flex gap-3">
                <Link2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                    <FormattedMessage
                      defaultMessage="Redirect URI"
                      id="Add SSO Modal / Redirect URI Title"
                    />
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    <FormattedMessage
                      defaultMessage="After creating the connection, you'll receive the exact redirect URI to configure in your IdP."
                      id="Add SSO Modal / Redirect URI Label OIDC"
                    />
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                    <FormattedMessage
                      defaultMessage="Tip: Make sure the Issuer URL includes https:// (e.g., https://your-tenant.us.auth0.com/)"
                      id="Add SSO Modal / Issuer Tip"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                <FormattedMessage
                  defaultMessage="SSO Connection Created!"
                  id="Add SSO Modal / Success Title"
                />
              </h3>
              <p className="text-sm text-muted-foreground max-w-[350px]">
                <FormattedMessage
                  defaultMessage="Complete the setup by configuring your identity provider with the information below."
                  id="Add SSO Modal / Success Description"
                />
              </p>
            </div>

            {spMetadataUrl && ssoType === 'saml' && (
              <div className="w-full rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium mb-2">
                  <FormattedMessage defaultMessage="SP Metadata URL:" id="Add SSO Modal / SP URL Label" />
                </p>
                <code className="block bg-background px-3 py-2 rounded text-xs break-all border">
                  {spMetadataUrl}
                </code>
              </div>
            )}

            {ssoType === 'oidc' && (oidcCallbackUrl || connectionId) && (
              <div className="w-full rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium mb-2">
                  <FormattedMessage defaultMessage="Redirect URI (update in your IdP):" id="Add SSO Modal / Redirect Label" />
                </p>
                <code className="block bg-background px-3 py-2 rounded text-xs break-all border">
                  {oidcCallbackUrl || `${window.location.origin}/api/sso/oidc/${connectionId}/callback`}
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  <FormattedMessage 
                    defaultMessage="Important: Update the callback URL in your identity provider settings with this exact URL, then activate the connection."
                    id="Add SSO Modal / Redirect Warning"
                  />
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="flex shrink-0 gap-3 border-t bg-background px-6 py-4">
        {step === 'select' && (
          <Button type="button" variant="outline" onClick={closeModal} className="w-full">
            <FormattedMessage defaultMessage="Cancel" id="Add SSO Modal / Cancel Button" />
          </Button>
        )}

        {step === 'configure' && (
          <>
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1" disabled={loading}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              <FormattedMessage defaultMessage="Back" id="Add SSO Modal / Back Button" />
            </Button>
            <Button type="submit" className="flex-1" disabled={loading || !isFormValid()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <FormattedMessage defaultMessage="Creating..." id="Add SSO Modal / Creating Button" />
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  <FormattedMessage defaultMessage="Create Connection" id="Add SSO Modal / Submit Button" />
                </>
              )}
            </Button>
          </>
        )}

        {step === 'success' && (
          <Button type="button" onClick={closeModal} className="w-full">
            <FormattedMessage defaultMessage="Done" id="Add SSO Modal / Done Button" />
          </Button>
        )}
      </div>
    </form>
  );
};
