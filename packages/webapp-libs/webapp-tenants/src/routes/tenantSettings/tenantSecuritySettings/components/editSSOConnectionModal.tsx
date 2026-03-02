import { apiURL, extractGraphQLErrors } from '@sb/webapp-api-client/api';
import { Connection_Type } from '@sb/webapp-api-client/graphql';
import { Button } from '@sb/webapp-core/components/buttons';
import { Input } from '@sb/webapp-core/components/forms';
import { Label } from '@sb/webapp-core/components/ui/label';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { camelCaseKeys } from '@sb/webapp-core/utils';
import { Check, Copy, Globe, Loader2, Shield, X } from 'lucide-react';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useTenantSSO } from '../../../../hooks/useTenantSSO';

export type EditSSOConnectionModalProps = {
  connection: {
    id: string;
    name: string;
    connectionType: string;
    allowedDomains: string[];
    samlEntityId?: string | null;
    samlSsoUrl?: string | null;
    oidcIssuer?: string | null;
    oidcClientId?: string | null;
    spMetadataUrl?: string | null;
    spAcsUrl?: string | null;
    spEntityId?: string | null;
    oidcCallbackUrl?: string | null;
    oidcLoginUrl?: string | null;
  };
  closeModal: () => void;
  onSuccess?: () => void;
  tenantId: string;
};

export const EditSSOConnectionModal = ({
  connection,
  closeModal,
  onSuccess,
  tenantId,
}: EditSSOConnectionModalProps) => {
  const intl = useIntl();
  const { toast } = useToast();
  const { updateConnection } = useTenantSSO(tenantId);

  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: connection.name,
    allowedDomains: [...connection.allowedDomains],
    entityId: connection.samlEntityId ?? '',
    ssoUrl: connection.samlSsoUrl ?? '',
    certificate: '',
    issuer: connection.oidcIssuer ?? '',
    clientId: connection.oidcClientId ?? '',
    clientSecret: '',
  });
  const [domainInput, setDomainInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isSaml = connection.connectionType?.toLowerCase() === 'saml';
  const isOidc = connection.connectionType?.toLowerCase() === 'oidc';

  const handleCopyUrl = async (url: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedField(fieldId);
      toast({
        description: intl.formatMessage({
          defaultMessage: 'URL copied to clipboard',
          id: 'Edit SSO Modal / URL Copied',
        }),
        variant: 'success',
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to copy URL',
          id: 'Edit SSO Modal / Copy Failed',
        }),
        variant: 'destructive',
      });
    }
  };

  const addDomain = () => {
    const domain = domainInput.trim().toLowerCase();
    if (domain && !formData.allowedDomains.includes(domain)) {
      setFormData((prev) => ({ ...prev, allowedDomains: [...prev.allowedDomains, domain] }));
      setDomainInput('');
    }
  };

  const removeDomain = (domain: string) => {
    setFormData((prev) => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((d) => d !== domain),
    }));
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    const input = isSaml
      ? {
          id: connection.id,
          tenantId,
          name: formData.name,
          connectionType: Connection_Type.SAML,
          allowedDomains: JSON.stringify(formData.allowedDomains),
          samlEntityId: formData.entityId,
          samlSsoUrl: formData.ssoUrl,
          ...(formData.certificate ? { samlCertificate: formData.certificate } : {}),
        }
      : {
          id: connection.id,
          tenantId,
          name: formData.name,
          connectionType: Connection_Type.OIDC,
          allowedDomains: JSON.stringify(formData.allowedDomains),
          oidcIssuer: formData.issuer,
          oidcClientId: formData.clientId,
          ...(formData.clientSecret.trim() ? { oidcClientSecret: formData.clientSecret } : {}),
        };

    try {
      await updateConnection({ variables: { input } });
      toast({
        description: intl.formatMessage({
          defaultMessage: 'SSO connection updated successfully!',
          id: 'Edit SSO Modal / Success Toast',
        }),
        variant: 'success',
      });
      onSuccess?.();
      closeModal();
    } catch (err) {
      const graphQLErrors = extractGraphQLErrors(err);
      const validationError = graphQLErrors?.find((e) => e.message === 'GraphQlValidationError');
      const fieldMap: Record<string, string> = {
        samlSsoUrl: 'ssoUrl',
        samlEntityId: 'entityId',
        samlCertificate: 'certificate',
        oidcIssuer: 'issuer',
        oidcClientId: 'clientId',
        oidcClientSecret: 'clientSecret',
        name: 'name',
        allowedDomains: 'allowedDomains',
      };
      const mapped: Record<string, string> = {};
      if (validationError?.extensions && typeof validationError.extensions === 'object') {
        const extensions = camelCaseKeys(validationError.extensions as Record<string, unknown>);
        for (const [key, val] of Object.entries(extensions)) {
          const formField = fieldMap[key] ?? key;
          mapped[formField] = Array.isArray(val) && val[0]?.message ? val[0].message : String(val);
        }
      }
      setFieldErrors(mapped);
      toast({
        description: intl.formatMessage({
          defaultMessage: 'Failed to update SSO connection.',
          id: 'Edit SSO Modal / Error Toast',
        }),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const redirectUri = connection.oidcCallbackUrl ?? apiURL(`/sso/oidc/${connection.id}/callback`);
  const initiateLoginUri = connection.oidcLoginUrl;

  return (
    <form onSubmit={handleSubmit} className="-m-6 flex max-h-[85vh] flex-col overflow-hidden sm:rounded-lg">
      <div className="flex shrink-0 items-center gap-3 border-b bg-background px-6 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            <FormattedMessage defaultMessage="Edit SSO Connection" id="Edit SSO Modal / Title" />
          </h2>
          <p className="text-sm text-muted-foreground">
            <FormattedMessage
              defaultMessage="View configuration values and update connection settings"
              id="Edit SSO Modal / Subtitle"
            />
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* SP Configuration Values (like success step) */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">
            <FormattedMessage defaultMessage="Service Provider Configuration" id="Edit SSO Modal / SP Config Title" />
          </h3>

          {isSaml && (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <FormattedMessage
                    defaultMessage="Copy these values to your identity provider (Google Workspace, Okta, Azure AD, etc.)."
                    id="Edit SSO Modal / SAML Instructions"
                  />
                </p>
              </div>
              {connection.spAcsUrl && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm font-medium mb-2">
                    <FormattedMessage
                      defaultMessage="ACS URL (Assertion Consumer Service):"
                      id="Edit SSO Modal / ACS URL Label"
                    />
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                      {connection.spAcsUrl}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleCopyUrl(connection.spAcsUrl!, 'acs')}
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
              {connection.spEntityId && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm font-medium mb-2">
                    <FormattedMessage
                      defaultMessage="Entity ID (SP Identifier):"
                      id="Edit SSO Modal / Entity ID Label"
                    />
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                      {connection.spEntityId}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleCopyUrl(connection.spEntityId!, 'entityId')}
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
              {connection.spMetadataUrl && (
                <div className="rounded-lg border bg-muted/30 p-4">
                  <p className="text-sm font-medium mb-2">
                    <FormattedMessage defaultMessage="SP Metadata URL (optional):" id="Edit SSO Modal / SP URL Label" />
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                      {connection.spMetadataUrl}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => handleCopyUrl(connection.spMetadataUrl!, 'metadata')}
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
                      id="Edit SSO Modal / SP Metadata Hint"
                    />
                  </p>
                </div>
              )}
            </>
          )}

          {isOidc && (
            <>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium mb-2">
                  <FormattedMessage
                    defaultMessage="Redirect URI (update in your IdP):"
                    id="Edit SSO Modal / Redirect Label"
                  />
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">{redirectUri}</code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => handleCopyUrl(redirectUri, 'oidc')}
                  >
                    {copiedField === 'oidc' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <FormattedMessage
                    defaultMessage="Update the callback URL in your identity provider settings with this exact URL."
                    id="Edit SSO Modal / Redirect Hint"
                  />
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm font-medium mb-2">
                  <FormattedMessage
                    defaultMessage="Initiate login URI (configure in your IdP):"
                    id="Edit SSO Modal / Initiate Login URI Label"
                  />
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background px-3 py-2 rounded text-xs break-all border">
                    {initiateLoginUri ?? '—'}
                  </code>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => initiateLoginUri && handleCopyUrl(initiateLoginUri, 'initiate-login')}
                    disabled={!initiateLoginUri}
                  >
                    {copiedField === 'initiate-login' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <FormattedMessage
                    defaultMessage="URL where your app initiates the OIDC login flow. Add this to your identity provider if required."
                    id="Edit SSO Modal / Initiate Login URI Hint"
                  />
                </p>
              </div>
            </>
          )}
        </div>

        {/* Edit Configuration */}
        <div className="space-y-4 border-t pt-6">
          <h3 className="text-sm font-medium">
            <FormattedMessage defaultMessage="Connection Settings" id="Edit SSO Modal / Edit Title" />
          </h3>

          <div className="space-y-2">
            <Label htmlFor="edit-name">
              <FormattedMessage defaultMessage="Connection Name" id="Edit SSO Modal / Name Label" />
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => updateFormData('name', e.target.value)}
              error={fieldErrors['name']}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-domains">
              <FormattedMessage defaultMessage="Allowed Email Domains" id="Edit SSO Modal / Domains Label" />
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="edit-domains"
                  className="pl-9"
                  placeholder={intl.formatMessage({
                    defaultMessage: 'e.g., company.com',
                    id: 'Edit SSO Modal / Domain Placeholder',
                  })}
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addDomain();
                    }
                  }}
                />
              </div>
              <Button type="button" variant="outline" onClick={addDomain} disabled={!domainInput.trim()}>
                <FormattedMessage defaultMessage="Add" id="Edit SSO Modal / Add Domain" />
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
                defaultMessage="Users from these domains can sign in via SSO. New users are automatically provisioned on first sign-in."
                id="Edit SSO Modal / Domains Help"
              />
            </p>
          </div>

          {isSaml && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-sso-url">
                  <FormattedMessage defaultMessage="SSO URL (Login URL)" id="Edit SSO Modal / SSO URL" />
                </Label>
                <Input
                  id="edit-sso-url"
                  value={formData.ssoUrl}
                  onChange={(e) => updateFormData('ssoUrl', e.target.value)}
                  error={fieldErrors['ssoUrl']}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-entity-id">
                  <FormattedMessage defaultMessage="IdP Entity ID / Issuer" id="Edit SSO Modal / Entity ID" />
                </Label>
                <Input
                  id="edit-entity-id"
                  value={formData.entityId}
                  onChange={(e) => updateFormData('entityId', e.target.value)}
                  error={fieldErrors['entityId']}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-certificate">
                  <FormattedMessage
                    defaultMessage="X.509 Certificate (leave blank to keep current)"
                    id="Edit SSO Modal / Certificate"
                  />
                </Label>
                <textarea
                  id="edit-certificate"
                  className="flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm font-mono text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="-----BEGIN CERTIFICATE-----..."
                  value={formData.certificate}
                  onChange={(e) => updateFormData('certificate', e.target.value)}
                />
                {fieldErrors['certificate'] && <p className="text-destructive text-sm">{fieldErrors['certificate']}</p>}
              </div>
            </>
          )}

          {isOidc && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-issuer">
                  <FormattedMessage defaultMessage="Issuer URL" id="Edit SSO Modal / Issuer" />
                </Label>
                <Input
                  id="edit-issuer"
                  value={formData.issuer}
                  onChange={(e) => updateFormData('issuer', e.target.value)}
                  error={fieldErrors['issuer']}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client-id">
                  <FormattedMessage defaultMessage="Client ID" id="Edit SSO Modal / Client ID" />
                </Label>
                <Input
                  id="edit-client-id"
                  value={formData.clientId}
                  onChange={(e) => updateFormData('clientId', e.target.value)}
                  error={fieldErrors['clientId']}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-client-secret">
                  <FormattedMessage
                    defaultMessage="Client Secret (leave blank to keep current)"
                    id="Edit SSO Modal / Client Secret"
                  />
                </Label>
                <Input
                  id="edit-client-secret"
                  type="password"
                  autoComplete="new-password"
                  placeholder={intl.formatMessage({
                    defaultMessage: '••••••••',
                    id: 'Edit SSO Modal / Client Secret Placeholder',
                  })}
                  value={formData.clientSecret}
                  onChange={(e) => updateFormData('clientSecret', e.target.value)}
                  error={fieldErrors['clientSecret']}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex shrink-0 gap-3 border-t bg-background px-6 py-4">
        <Button type="button" variant="outline" onClick={closeModal} className="flex-1">
          <FormattedMessage defaultMessage="Cancel" id="Edit SSO Modal / Cancel" />
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <FormattedMessage defaultMessage="Saving..." id="Edit SSO Modal / Saving" />
            </>
          ) : (
            <FormattedMessage defaultMessage="Save Changes" id="Edit SSO Modal / Save" />
          )}
        </Button>
      </div>
    </form>
  );
};
