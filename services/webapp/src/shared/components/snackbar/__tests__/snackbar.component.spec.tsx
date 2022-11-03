import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../../../tests/utils/rendering';
import { Snackbar } from '../snackbar.component';
import { snackbarActions } from '../../../../modules/snackbar';
import { prepareState } from '../../../../mocks/store';

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

  const reduxInitialState = prepareState((state) => {
    state.snackbar.messages = [
      { id: 1, text: 'first message' },
      { id: 2, text: 'second message' },
    ];
    return state;
  });

  it('should render all messages', () => {
    render(<Snackbar />, { reduxInitialState });
    expect(screen.getByText('first message')).toBeInTheDocument();
    expect(screen.getByText('second message')).toBeInTheDocument();
  });

  describe('message close icon is clicked', () => {
    it('should dispatch hideMessage with proper id', async () => {
      render(<Snackbar />, { reduxInitialState });
      const firstMessageCloseButton = screen.getAllByLabelText(/dismiss/gi)[0];
      await userEvent.click(firstMessageCloseButton);
      expect(mockDispatch).toHaveBeenCalledWith(snackbarActions.hideMessage(1));
    });
  });
});
