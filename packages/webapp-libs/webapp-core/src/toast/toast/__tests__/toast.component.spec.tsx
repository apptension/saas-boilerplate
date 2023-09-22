import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Fragment, useEffect } from 'react';

import { render } from '../../../tests/utils/rendering';
import { useToast } from '../../useToast';

const Component = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({ description: 'first message' });
    toast({ description: 'second message' });
  }, [toast]);

  return <Fragment />;
};

describe('Toast: Component', () => {
  it('should render all messages', async () => {
    render(<Component />);

    expect(await screen.findByText('first message')).toBeInTheDocument();
    expect(screen.getByText('second message')).toBeInTheDocument();
  });

  describe('message close icon is clicked', () => {
    it('should dispatch hideToast with proper id', async () => {
      render(<Component />);

      const firstMessageCloseButton = screen.getAllByLabelText(/dismiss/i)[0];
      await userEvent.click(firstMessageCloseButton);

      const message = screen.queryByText('first message');
      expect(message).not.toBeInTheDocument();
    });
  });
});
