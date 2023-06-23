import { fireEvent, screen } from '@testing-library/react';
import React from 'react';

import { useTheme } from '../../../hooks/useTheme';
import { render } from '../../../tests/utils/rendering';
import { ThemeProvider } from '../themeProvider';
import { THEME_DEFAULT_STORAGE_KEY, Themes } from '../themeProvider.types';

let localStorageMock: { [key: string]: string } = {};

describe('ThemeProvider', () => {
  const HelperComponent: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
      <>
        <p data-testid="theme">{theme}</p>
        <button onClick={toggleTheme} data-testid="toggleTheme">
          toggle theme
        </button>
      </>
    );
  };

  const Component: React.FC = () => {
    return (
      <ThemeProvider>
        <HelperComponent />
      </ThemeProvider>
    );
  };

  beforeAll(() => {
    global.Storage.prototype.getItem = jest.fn((key: string) => localStorageMock[key]);
    global.Storage.prototype.setItem = jest.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
  });

  beforeEach(() => {
    localStorageMock = {};
  });

  describe('storage', () => {
    it('should save light theme', async () => {
      render(<Component />);

      expect(screen.getByTestId('theme').textContent).toBe(Themes.LIGHT);
      expect(global.localStorage.getItem(THEME_DEFAULT_STORAGE_KEY)).toBe(Themes.LIGHT);
    });

    it('should toggle and save dark theme', async () => {
      render(<Component />);

      fireEvent.click(screen.getByTestId('toggleTheme'));

      expect(screen.getByTestId('theme').textContent).toBe(Themes.DARK);
      expect(global.localStorage.getItem(THEME_DEFAULT_STORAGE_KEY)).toBe(Themes.DARK);
    });
  });
});
