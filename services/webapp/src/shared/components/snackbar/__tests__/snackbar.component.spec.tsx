import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeContextRenderer } from '../../../utils/testUtils';
import { Snackbar } from '../snackbar.component';
import { snackbarActions } from '../../../../modules/snackbar';

const mockDispatch = jest.fn();
jest.mock('react-redux', () => {
  return {
    ...jest.requireActual<NodeModule>('react-redux'),
    useDispatch: () => mockDispatch,
  };
});

describe('Snackbar: Component', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  const component = () => <Snackbar />;
  const render = makeContextRenderer(component, {
    store: (state) => {
      state.snackbar.messages = [
        { id: 1, text: 'first message' },
        { id: 2, text: 'second message' },
      ];
    },
  });

  it('should render all messages', () => {
    render();
    expect(screen.getByText('first message')).toBeInTheDocument();
    expect(screen.getByText('second message')).toBeInTheDocument();
  });

  describe('message close icon is clicked', () => {
    it('should dispatch hideMessage with proper id', () => {
      render();
      const firstMessageCloseButton = screen.getAllByLabelText(/dismiss/gi)[0];
      userEvent.click(firstMessageCloseButton);
      expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.hideMessage(1));
    });
  });
});
