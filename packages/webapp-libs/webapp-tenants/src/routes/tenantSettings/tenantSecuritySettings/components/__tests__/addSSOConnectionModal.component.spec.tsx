import { apiClient, apiURL } from '@sb/webapp-api-client/api';
import { currentUserFactory, fillCommonQueryWithUser } from '@sb/webapp-api-client/tests/factories';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { membershipFactory, tenantFactory } from '../../../../../tests/factories/tenant';
import { render } from '../../../../../tests/utils/rendering';
import { AddSSOConnectionModal } from '../addSSOConnectionModal';

jest.mock('@sb/webapp-api-client/api', () => ({
  apiClient: {
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  },
  apiURL: jest.fn((path: string) => path),
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const TENANT_ID = 'tenant-sso-1';

describe('AddSSOConnectionModal: Component', () => {
  const closeModal = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockedApiClient.post.mockResolvedValue({
      data: {
        id: 'conn-1',
        spMetadataUrl: 'https://example.com/metadata',
        spAcsUrl: 'https://example.com/acs',
        spEntityId: 'https://example.com/entity',
        oidcCallbackUrl: null,
      },
    });
  });

  const renderComponent = () => {
    const tenant = tenantFactory({
      id: TENANT_ID,
      membership: membershipFactory({ role: 'OWNER' as const }),
    });
    const apolloMocks = [fillCommonQueryWithUser(currentUserFactory({ tenants: [tenant] }))];

    return render(
      <AddSSOConnectionModal closeModal={closeModal} onSuccess={onSuccess} tenantId={TENANT_ID} />,
      { apolloMocks }
    );
  };

  it('should render protocol selection step', async () => {
    renderComponent();

    expect(await screen.findByText(/Add SSO Connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose your SSO protocol to get started/i)).toBeInTheDocument();
    expect(screen.getByText('SAML 2.0')).toBeInTheDocument();
    expect(screen.getByText('OpenID Connect')).toBeInTheDocument();
  });

  it('should call closeModal when Cancel is clicked', async () => {
    renderComponent();

    const cancelButton = await screen.findByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);

    expect(closeModal).toHaveBeenCalled();
  });

  it('should navigate to SAML configure step when SAML is selected', async () => {
    renderComponent();

    const samlButtons = await screen.findAllByRole('button');
    const samlButton = samlButtons.find((b) => b.textContent?.includes('SAML 2.0'));
    if (samlButton) await userEvent.click(samlButton);

    expect(await screen.findByText(/Configure SAML Connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection Details/i)).toBeInTheDocument();
    expect(screen.getByText(/Identity Provider Settings/i)).toBeInTheDocument();
  });

  it('should navigate to OIDC configure step when OIDC is selected', async () => {
    renderComponent();

    const oidcButtons = await screen.findAllByRole('button');
    const oidcButton = oidcButtons.find((b) => b.textContent?.includes('OpenID Connect'));
    if (oidcButton) await userEvent.click(oidcButton);

    expect(await screen.findByText(/Configure OIDC Connection/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection Details/i)).toBeInTheDocument();
    expect(screen.getByText(/OAuth 2\.0 \/ OIDC Settings/i)).toBeInTheDocument();
  });

  it('should navigate back to select step when Back is clicked', async () => {
    renderComponent();

    const samlButtons = await screen.findAllByRole('button');
    const samlButton = samlButtons.find((b) => b.textContent?.includes('SAML 2.0'));
    if (samlButton) await userEvent.click(samlButton);
    expect(await screen.findByText(/Configure SAML Connection/i)).toBeInTheDocument();

    const backButton = await screen.findByRole('button', { name: /Back/i });
    await userEvent.click(backButton);

    expect(await screen.findByText(/Choose your SSO protocol to get started/i)).toBeInTheDocument();
  });

  it('should show Create Connection button disabled when form is invalid', async () => {
    renderComponent();

    const samlButtons = await screen.findAllByRole('button');
    const samlButton = samlButtons.find((b) => b.textContent?.includes('SAML 2.0'));
    if (samlButton) await userEvent.click(samlButton);

    const submitButton = await screen.findByRole('button', { name: /Create Connection/i });
    expect(submitButton).toBeDisabled();
  });

  it('should create connection and show success step when form is valid', async () => {
    renderComponent();

    const samlButtons = await screen.findAllByRole('button');
    const samlButton = samlButtons.find((b) => b.textContent?.includes('SAML 2.0'));
    if (samlButton) await userEvent.click(samlButton);

    await userEvent.type(await screen.findByPlaceholderText(/e\.g\., Okta Production/i), 'Test Connection');
    await userEvent.type(await screen.findByPlaceholderText(/e\.g\., company\.com/i), 'example.com');
    await userEvent.click(await screen.findByRole('button', { name: /^Add$/i }));

    await userEvent.type(await screen.findByPlaceholderText(/https:\/\/idp\.example\.com\/saml\/metadata/i), 'https://idp.example.com');
    await userEvent.type(await screen.findByPlaceholderText(/https:\/\/idp\.example\.com\/saml\/sso/i), 'https://idp.example.com/sso');
    const certificateField = await screen.findByLabelText(/X\.509 Certificate/i);
    await userEvent.type(certificateField, '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----');

    const submitButton = await screen.findByRole('button', { name: /Create Connection/i });
    await userEvent.click(submitButton);

    expect(await screen.findByText(/SSO Connection Created!/i)).toBeInTheDocument();
    expect(await screen.findByText(/Complete the setup by configuring your identity provider/i)).toBeInTheDocument();
    expect(mockedApiClient.post).toHaveBeenCalledWith(
      expect.stringContaining(`/sso/tenant/${TENANT_ID}/connections/`),
      expect.objectContaining({
        name: 'Test Connection',
        connectionType: 'saml',
        allowedDomains: ['example.com'],
        samlEntityId: 'https://idp.example.com',
        samlSsoUrl: 'https://idp.example.com/sso',
        samlCertificate: '-----BEGIN CERTIFICATE-----\ntest\n-----END CERTIFICATE-----',
      })
    );
  });
});
