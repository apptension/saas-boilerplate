import { useState } from 'react';
import { apiURL, extractGraphQLErrors } from '@sb/webapp-api-client/api';
import { Button } from '@sb/webapp-core/components/buttons';
import { cn } from '@sb/webapp-core/lib/utils';
import { camelCaseKeys } from '@sb/webapp-core/utils';
import { Input } from '@sb/webapp-core/components/forms';
import { Label } from '@sb/webapp-core/components/ui/label';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Shield, Key, Building2, ArrowLeft, Link2, CheckCircle2, Loader2, Copy, Check, Globe, X } from 'lucide-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Connection_Type } from '@sb/webapp-api-client/graphql';
import { useTenantSSO } from '../../../../hooks/useTenantSSO';

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
  const { createConnection } = useTenantSSO(tenantId);

  const [step, setStep] = useState<Step>('select');
  const [ssoType, setSsoType] = useState<SSOType>(null);
  const [loading, setLoading] = useState(false);
  const [spMetadataUrl, setSpMetadataUrl] = useState<string | null>(null);
  const [spAcsUrl, setSpAcsUrl] = useState<string | null>(null);
  const [spEntityId, setSpEntityId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [oidcCallbackUrl, setOidcCallbackUrl] = useState<string | null>(null);
  const [oidcLoginUrl, setOidcLoginUrl] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    allowedDomains: [] as string[],
    // SAML fields
    entityId: '',
    ssoUrl: '',
    certificate: '',
    // OIDC fields
    issuer: '',
    clientId: '',
    clientSecret: '',
  });
  const [domainInput, setDomainInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  /** Maps backend/camelCase field names to form field names */
  const BACKEND_TO_FORM_FIELD: Record<string, string> = {
    samlSsoUrl: 'ssoUrl',
    samlEntityId: 'entityId',
    samlCertificate: 'certificate',
    oidcIssuer: 'issuer',
    oidcClientId: 'clientId',
    oidcClientSecret: 'clientSecret',
    name: 'name',
    allowedDomains: 'allowedDomains',
  };

  const handleSSOTypeSelect = (type: SSOType) => {
    setSsoType(type);
    setStep('configure');
  };

  const handleBack = () => {
    if (step === 'configure') {
      setStep('select');
      setSsoType(null);
      setFieldErrors({});
    }
  };

  const handleCopyUrl = async (url: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedField(fieldId);
      toast({
        description: intl.formatMessage({
          defaultMessage: 'URL copied to clipboard',
          id: 'Add SSO Modal / URL Copied',
        }),
        variant: 'success',
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to copy URL',
          id: 'Add SSO Modal / Copy Failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async () => {
    if (!ssoType || !tenantId) return;

    setLoading(true);
    setFieldErrors({});

    const input = ssoType === 'saml'
      ? {
          tenantId,
          name: formData.name,
          connectionType: Connection_Type.SAML,
          allowedDomains: JSON.stringify(formData.allowedDomains),
          samlEntityId: formData.entityId,
          samlSsoUrl: formData.ssoUrl,
          samlCertificate: formData.certificate || undefined,
        }
      : {
          tenantId,
          name: formData.name,
          connectionType: Connection_Type.OIDC,
          allowedDomains: JSON.stringify(formData.allowedDomains),
          oidcIssuer: formData.issuer,
          oidcClientId: formData.clientId,
          ...(formData.clientSecret.trim() ? { oidcClientSecret: formData.clientSecret } : {}),
        };

    try {
      const result = await createConnection({ variables: { input } });
      const conn = result.data?.createSsoConnection?.ssoConnection;

      if (conn?.id) {
        setConnectionId(conn.id);
      }
      if (conn?.spMetadataUrl) {
        setSpMetadataUrl(conn.spMetadataUrl);
      }
      if (conn?.spAcsUrl) {
        setSpAcsUrl(conn.spAcsUrl);
      }
      if (conn?.spEntityId) {
        setSpEntityId(conn.spEntityId);
      }
      if (conn?.oidcCallbackUrl) {
        setOidcCallbackUrl(conn.oidcCallbackUrl);
      }
      if (conn?.oidcLoginUrl) {
        setOidcLoginUrl(conn.oidcLoginUrl);
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
            const graphQLErrors = extractGraphQLErrors(error);
      const validationError = graphQLErrors?.find((e) => e.message === 'GraphQlValidationError');

      let extractedErrors: Record<string, string> = {};
      if (validationError?.extensions && typeof validationError.extensions === 'object') {
        const extensions = camelCaseKeys(validationError.extensions as Record<string, unknown>);
        for (const [backendField, value] of Object.entries(extensions)) {
          if (Array.isArray(value) && value[0]?.message) {
            const formField = BACKEND_TO_FORM_FIELD[backendField] ?? backendField;
            extractedErrors[formField] = value[0].message;
          }
        }
        setFieldErrors(extractedErrors);
      }

      if (!validationError || Object.keys(extractedErrors).length === 0) {
        toast({
          description:
            error instanceof Error
              ? error.message
              : intl.formatMessage({
                  defaultMessage: 'Failed to create SSO connection.',
                  id: 'Add SSO Modal / Error Toast',
                }),
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addDomain = () => {
    const domain = domainInput.trim().toLowerCase();
    if (domain && !formData.allowedDomains.includes(domain)) {
      // Basic domain validation
      if (domain.includes('.') && !domain.includes(' ')) {
        setFormData((prev) => ({
          ...prev,
          allowedDomains: [...prev.allowedDomains, domain],
        }));
        setDomainInput('');
      } else {
        toast({
          description: intl.formatMessage({
            defaultMessage: 'Please enter a valid domain (e.g., example.com)',
            id: 'SSO Form / Invalid Domain',
          }),
          variant: 'destructive',
        });
      }
    }
  };

  const removeDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((d) => d !== domain),
    }));
  };

  const handleDomainKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addDomain();
    }
  };

  const isFormValid = () => {
    if (!formData.name.trim()) return false;
    if (formData.allowedDomains.length === 0) return false;
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
      className="-m-6 flex h-[85vh] max-h-[700px] flex-col overflow-hidden sm:rounded-lg"
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
            {/* SP Metadata Info - at top */}
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
                    error={fieldErrors['name']}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-domains-idp">
                    <FormattedMessage defaultMessage="Allowed Email Domains" id="SSO Form / Allowed Domains Label" />
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="allowed-domains-idp"
                        className="pl-9"
                        placeholder={intl.formatMessage({
                          defaultMessage: 'e.g., company.com',
                          id: 'SSO Form / Domain Placeholder',
                        })}
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        onKeyDown={handleDomainKeyDown}
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={addDomain} disabled={!domainInput.trim()}>
                      <FormattedMessage defaultMessage="Add" id="SSO Form / Add Domain Button" />
                    </Button>
                  </div>
                  {formData.allowedDomains.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.allowedDomains.map((domain) => (
                        <span
                          key={domain}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {domain}
                          <button
                            type="button"
                            onClick={() => removeDomain(domain)}
                            className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {fieldErrors['allowedDomains'] && (
                    <p className="text-destructive text-sm">{fieldErrors['allowedDomains']}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <FormattedMessage
                      defaultMessage="Users with email addresses from these domains can use this SSO connection to sign in. New users from these domains are automatically provisioned on first sign-in."
                      id="SSO Form / Allowed Domains Help"
                    />
                  </p>
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
                      error={fieldErrors['entityId']}
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
                      error={fieldErrors['ssoUrl']}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificate">
                      <FormattedMessage defaultMessage="X.509 Certificate" id="SSO Form / Certificate Label" />
                    </Label>
                    <div>
                      <textarea
                        id="certificate"
                        className={cn(
                          'flex min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 font-mono text-xs',
                          fieldErrors['certificate']
                            ? 'border-destructive focus-visible:ring-destructive'
                            : 'border-input'
                        )}
                        placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDXTCCAkWgAwIBAgIJANI..."
                        value={formData.certificate}
                        onChange={(e) => updateFormData('certificate', e.target.value)}
                      />
                      {fieldErrors['certificate'] && (
                        <p className="text-destructive mt-1.5 text-sm leading-tight">{fieldErrors['certificate']}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'configure' && ssoType === 'oidc' && (
          <div className="space-y-6">
            {/* Redirect URI Info - at top */}
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
                      defaultMessage="After creating the connection, you'll receive the Redirect URI (callback URL) and Initiate login URI (login link) to configure in your IdP."
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
                    error={fieldErrors['name']}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="oidc-allowed-domains">
                    <FormattedMessage defaultMessage="Allowed Email Domains" id="OIDC Form / Allowed Domains Label" />
                  </Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="oidc-allowed-domains"
                        className="pl-9"
                        placeholder={intl.formatMessage({
                          defaultMessage: 'e.g., company.com',
                          id: 'OIDC Form / Domain Placeholder',
                        })}
                        value={domainInput}
                        onChange={(e) => setDomainInput(e.target.value)}
                        onKeyDown={handleDomainKeyDown}
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={addDomain} disabled={!domainInput.trim()}>
                      <FormattedMessage defaultMessage="Add" id="OIDC Form / Add Domain Button" />
                    </Button>
                  </div>
                  {formData.allowedDomains.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.allowedDomains.map((domain) => (
                        <span
                          key={domain}
                          className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {domain}
                          <button
                            type="button"
                            onClick={() => removeDomain(domain)}
                            className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {fieldErrors['allowedDomains'] && (
                    <p className="text-destructive text-sm">{fieldErrors['allowedDomains']}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    <FormattedMessage
                      defaultMessage="Users with email addresses from these domains can use this SSO connection to sign in. New users from these domains are automatically provisioned on first sign-in."
                      id="OIDC Form / Allowed Domains Help"
                    />
                  </p>
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
                      error={fieldErrors['issuer']}
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
                      error={fieldErrors['clientId']}
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
                      error={fieldErrors['clientSecret']}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center h-full">
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

              {ssoType === 'saml' && (
                <div className="w-full space-y-4 p-4">

                  {/* Instructions */}
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <FormattedMessage
                        defaultMessage="Copy these values to your identity provider (Google Workspace, Okta, Azure AD, etc.). Enable 'Signed response' if your IdP supports it."
                        id="Add SSO Modal / SAML Instructions"
                      />
                    </p>
                  </div>
                  {/* ACS URL */}
                  {spAcsUrl && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm font-medium mb-2">
                        <FormattedMessage defaultMessage="ACS URL (Assertion Consumer Service):" id="Add SSO Modal / ACS URL Label" />
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                          {spAcsUrl}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
onClick={() => handleCopyUrl(spAcsUrl, 'acs')}
                      >
                        {copiedField === 'acs' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Entity ID */}
                  {spEntityId && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm font-medium mb-2">
                        <FormattedMessage defaultMessage="Entity ID (SP Identifier):" id="Add SSO Modal / Entity ID Label" />
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                          {spEntityId}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
onClick={() => handleCopyUrl(spEntityId, 'entityId')}
                      >
                        {copiedField === 'entityId' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* SP Metadata URL */}
                  {spMetadataUrl && (
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <p className="text-sm font-medium mb-2">
                        <FormattedMessage defaultMessage="SP Metadata URL (optional):" id="Add SSO Modal / SP URL Label" />
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                          {spMetadataUrl}
                        </code>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-9 w-9 shrink-0"
onClick={() => handleCopyUrl(spMetadataUrl, 'metadata')}
                      >
                        {copiedField === 'metadata' ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        <FormattedMessage
                          defaultMessage="Some IdPs can auto-import configuration from this URL."
                          id="Add SSO Modal / SP Metadata Hint"
                        />
                      </p>
                    </div>
                  )}

                </div>
              )}

              {ssoType === 'oidc' && (oidcCallbackUrl || connectionId) && (
                <div className="w-full space-y-4 p-4">
                  <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <FormattedMessage
                        defaultMessage="Important: Add the Redirect URI (callback URL) and Initiate login URI (login link) in your identity provider settings with the exact URLs below, then activate the connection."
                        id="Add SSO Modal / Redirect Warning"
                      />
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-medium mb-2">
                      <FormattedMessage defaultMessage="Redirect URI (update in your IdP):" id="Add SSO Modal / Redirect Label" />
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                        {oidcCallbackUrl || apiURL(`/sso/oidc/${connectionId}/callback`)}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => handleCopyUrl(oidcCallbackUrl || apiURL(`/sso/oidc/${connectionId}/callback`), 'oidc')}
                      >
                        {copiedField === 'oidc' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <p className="text-sm font-medium mb-2">
                      <FormattedMessage
                        defaultMessage="Initiate login URI (configure in your IdP):"
                        id="Add SSO Modal / Initiate Login URI Label"
                      />
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                        {oidcLoginUrl ?? '—'}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 shrink-0"
                        onClick={() => oidcLoginUrl && handleCopyUrl(oidcLoginUrl, 'initiate-login')}
                        disabled={!oidcLoginUrl}
                      >
                        {copiedField === 'initiate-login' ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
