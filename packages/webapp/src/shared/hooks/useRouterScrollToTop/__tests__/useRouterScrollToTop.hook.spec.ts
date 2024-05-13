import { renderHook } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import { useRouterScrollToTop } from '../';

jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

const scrollToMock = jest.fn();

describe('useRouterScrollToTop', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.scrollTo = scrollToMock;
  });

  it('should call window.scrollTo on pathname change', () => {
    const mockLocation = { pathname: '/test' };
    (useLocation as jest.Mock).mockReturnValue(mockLocation);

    renderHook(() => useRouterScrollToTop());

    expect(scrollToMock).toHaveBeenCalledWith(0, 0);
  });
});
