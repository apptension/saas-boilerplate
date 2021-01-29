import { renderHook } from '@testing-library/react-hooks';
import { useStartup, useProfileStartup } from '../useStartup.hook';
import initializeFonts from '../../../theme/initializeFontFace';
import { startupActions } from '../../../modules/startup';

const mockDispatch = jest.fn();
jest.mock('../../../theme/initializeFontFace');

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
}));

describe('useStartup: Hook', () => {
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

describe('useProfileStartup: Hook', () => {
  const render = () => renderHook(() => useProfileStartup());

  it('should call profileStartup on mount', () => {
    render();
    expect(mockDispatch).toHaveBeenCalledWith(startupActions.profileStartup());
  });
});
