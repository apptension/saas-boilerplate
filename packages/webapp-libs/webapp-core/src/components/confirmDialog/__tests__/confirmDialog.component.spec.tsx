import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { render } from '../../../tests/utils/rendering';
import { ConfirmDialog, ConfirmDialogProps } from '../confirmDialog.component';

describe('ConfirmDialog: Component', () => {
  const title = 'Title';
  const defaultProps: ConfirmDialogProps = {
    title,
    onContinue: jest.fn(),
    onCancel: jest.fn(),
  };

  const Component = (props: Partial<ConfirmDialogProps>) => <ConfirmDialog {...defaultProps} {...props} />;

  it('should open dialog', async () => {
    const label = 'trigger';

    render(
      <Component>
        <button>{label}</button>
      </Component>
    );

    await userEvent.click(screen.getByText(label));

    expect(screen.getByText(title)).toBeInTheDocument();
  });

  describe('when open', () => {
    it('should continue', async () => {
      const trigger = 'trigger';
      const onContinue = jest.fn();
      render(
        <Component onContinue={onContinue}>
          <button>{trigger}</button>
        </Component>
      );

      await userEvent.click(screen.getByText(trigger));
      await userEvent.click(screen.getByText('Continue'));

      expect(onContinue).toBeCalled();
    });

    it('should cancel', async () => {
      const trigger = 'trigger';
      const onCancel = jest.fn();
      render(
        <Component onCancel={onCancel}>
          <button>{trigger}</button>
        </Component>
      );

      await userEvent.click(screen.getByText(trigger));
      await userEvent.click(screen.getByText('Cancel'));

      expect(onCancel).toBeCalled();
    });
  });
});
