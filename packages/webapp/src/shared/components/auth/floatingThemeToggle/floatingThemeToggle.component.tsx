import { Button } from '@sb/webapp-core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Locale, DEFAULT_LOCALE } from '@sb/webapp-core/config/i18n';
import { useLocales, useAvailableLocales } from '@sb/webapp-core/hooks';
import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { cn } from '@sb/webapp-core/lib/utils';
import { Themes } from '@sb/webapp-core/providers/themeProvider';
import { Moon, Sun, Check, Settings } from 'lucide-react';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate, useLocation } from 'react-router-dom';

export const FloatingThemeToggle = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { locales: localeContext, setLanguage } = useLocales();
  const { locales: availableLocales, getFlag } = useAvailableLocales();

  const currentLocale = localeContext.language || DEFAULT_LOCALE;

  // Get list of available locale codes for path validation
  const availableLocaleCodes = useMemo(
    () => availableLocales.map((l) => l.code),
    [availableLocales]
  );

  const handleLanguageChange = (code: string) => {
    if (code === currentLocale) return;

    const pathParts = location.pathname.split('/');

    if (pathParts.length > 1 && availableLocaleCodes.includes(pathParts[1])) {
      pathParts[1] = code;
    } else if (pathParts.length > 1) {
      pathParts.splice(1, 0, code);
    }

    const newPath = pathParts.join('/') || `/${code}`;

    setLanguage(code as Locale);
    navigate(newPath + location.search, { replace: true });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full shadow-lg"
            aria-label={intl.formatMessage({
              id: 'Auth / Floating controls aria label',
              defaultMessage: 'Settings menu',
            })}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-52" sideOffset={8}>
          {/* Theme toggle */}
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer gap-3">
            {theme === Themes.DARK ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="flex-1">
              {theme === Themes.DARK ? (
                <FormattedMessage defaultMessage="Light mode" id="Auth / Floating / Light mode" />
              ) : (
                <FormattedMessage defaultMessage="Dark mode" id="Auth / Floating / Dark mode" />
              )}
            </span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Language options */}
          <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
            <FormattedMessage defaultMessage="Language" id="Auth / Floating / Language label" />
          </div>
          {availableLocales.map((locale) => {
            const isActive = locale.code === currentLocale;

            return (
              <DropdownMenuItem
                key={locale.code}
                onClick={() => handleLanguageChange(locale.code)}
                className={cn('cursor-pointer gap-3', isActive && 'bg-accent')}
              >
                <span className="text-base" role="img" aria-label={locale.name}>
                  {getFlag(locale.code)}
                </span>
                <span className="flex-1 text-sm">{locale.native_name}</span>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
