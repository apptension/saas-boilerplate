import { Button } from '@sb/webapp-core/components/ui/button';
import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { Themes } from '@sb/webapp-core/providers/themeProvider';
import { Moon, Sun } from 'lucide-react';

export const FloatingThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
      aria-label="Toggle theme"
    >
      {theme === Themes.DARK ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};
