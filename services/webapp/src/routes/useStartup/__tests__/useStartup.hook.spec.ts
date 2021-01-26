import { renderHook } from '@testing-library/react-hooks';
import { useStartup } from '../useStartup.hook';
import initializeFonts from '../../../theme/initializeFontFace';
import { startupActions } from '../../../modules/startup';

const render = () => renderHook(() => useStartup());

const mockDispatch = jest.fn();
jest.mock('../../../theme/initializeFontFace');

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

describe('useStartup: Hook', () => {
  it('should call startup on mount', () => {
    render();
    expect(mockDispatch).toHaveBeenCalledWith(startupActions.startup());
  });

  it('should initialize fonts on mount', () => {
    render();
    expect(initializeFonts).toHaveBeenCalled();
  });
});
