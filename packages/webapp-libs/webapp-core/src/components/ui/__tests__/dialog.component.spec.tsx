import { fireEvent, screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Dialog, DialogContent, DialogHeader } from '../dialog';

describe('UI/Dialog: Component', () => {
  const content = 'content';
  const header = 'header';

  it('should be open', async () => {
    render(
      <Dialog open={true}>
        <DialogContent>{content}</DialogContent>
      </Dialog>
    );

    expect(await screen.findByText(content)).toBeInTheDocument();
  });
  it('should have custom header', async () => {
    render(
      <Dialog open={true}>
        <DialogHeader>{header}</DialogHeader>
        <DialogContent>{content}</DialogContent>
      </Dialog>
    );

    expect(await screen.findByText(content)).toBeInTheDocument();
    expect(await screen.findByText(header)).toBeInTheDocument();
  });
  it('should be close', async () => {
    render(
      <Dialog defaultOpen={false} open={false}>
        <DialogContent>{content}</DialogContent>
      </Dialog>
    );

    expect(screen.queryByText(content)).toBeNull();
  });
  it('should be call onClose on IconContainer submit', async () => {
    const onOpenChange = jest.fn();

    render(
      <Dialog open={true} onOpenChange={onOpenChange}>
        <DialogContent>{content}</DialogContent>
      </Dialog>
    );

    fireEvent.click(await screen.findByTestId('dialog-icon-container'));
    expect(onOpenChange).toHaveBeenCalled();
  });
});
