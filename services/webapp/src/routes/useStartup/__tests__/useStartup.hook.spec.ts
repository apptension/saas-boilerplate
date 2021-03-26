import { renderHook } from '@testing-library/react-hooks';
import { useStartup } from '../useStartup.hook';
import initializeFonts from '../../../theme/initializeFontFace';
import { startupActions } from '../../../modules/startup';

const mockDispatch = jest.fn();
jest.mock('../../../theme/initializeFontFace');

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

describe('useStartup: Hook', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  const render = () => renderHook(() => useStartup());

  it('should call startup on mount', () => {
    render();
    expect(mockDispatch).toHaveBeenCalledWith(startupActions.startup());
  });

  it('should initialize fonts on mount', () => {
    render();
    expect(initializeFonts).toHaveBeenCalled();
  });
});
