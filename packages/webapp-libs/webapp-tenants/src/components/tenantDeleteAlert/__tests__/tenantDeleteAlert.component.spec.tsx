import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { TenantDeleteAlert, TenantDeleteAlertProps } from '../tenantDeleteAlert.component';

const defaultProps: TenantDeleteAlertProps = {
  disabled: false,
  onContinue: jest.fn(),
};

describe('TenantDeleteAlert: Component', () => {
  const Component = (args: Partial<TenantDeleteAlertProps>) => <TenantDeleteAlert {...defaultProps} {...args} />;

  it('should render alert when button is clicked', async () => {
    render(<Component />);

    const button = await screen.findByRole('button', { name: /remove organization/i });
    await userEvent.click(button);

    expect(await screen.findByText('Are you absolutely sure?')).toBeInTheDocument();
  });

  it('should call onContinue', async () => {
    const onContinueMock = jest.fn();
    render(<Component onContinue={onContinueMock} />);

    const button = await screen.findByRole('button', { name: /remove organization/i });
    await userEvent.click(button);

    const continueButton = await screen.findByRole('button', { name: /continue/i });
    await userEvent.click(continueButton);

    expect(onContinueMock).toHaveBeenCalled();
    expect(screen.queryByText('Are you absolutely sure?')).not.toBeInTheDocument();
  });

  it('should hide Alert on Cancel click', async () => {
    const onContinueMock = jest.fn();
    render(<Component onContinue={onContinueMock} />);

    const button = await screen.findByRole('button', { name: /remove organization/i });
    await userEvent.click(button);

    const continueButton = await screen.findByRole('button', { name: /cancel/i });
    await userEvent.click(continueButton);

    expect(screen.queryByText('Are you absolutely sure?')).not.toBeInTheDocument();
  });
});
