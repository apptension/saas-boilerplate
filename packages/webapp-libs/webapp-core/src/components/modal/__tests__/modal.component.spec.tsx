import { fireEvent, screen } from '@testing-library/react';

import { render } from '../../../tests/utils/rendering';
import { Modal } from '../modal.component';

describe('Modal: Component', () => {
  const content = 'content';
  const header = 'header';

  it('should be open', async () => {
    render(<Modal isOpen={true}>{content}</Modal>);

    expect(await screen.findByText(content)).toBeInTheDocument();
  });
  it('should have custom header', async () => {
    render(
      <Modal isOpen={true} header={header}>
        {content}
      </Modal>
    );

    expect(await screen.findByText(content)).toBeInTheDocument();
    expect(await screen.findByText(header)).toBeInTheDocument();
    expect(screen.queryByTestId('modal-icon-container')).toBeNull();
  });
  it('should be close', async () => {
    render(<Modal isOpen={false}>{content}</Modal>);

    expect(screen.queryByText(content)).toBeNull();
  });
  it('should be call onClose on IconContainer submit', async () => {
    const onClose = jest.fn();

    render(
      <Modal isOpen={true} onClose={onClose}>
        {content}
      </Modal>
    );

    fireEvent.click(await screen.findByTestId('modal-icon-container'));
    expect(onClose).toHaveBeenCalled();
  });
});
