import { Button } from '@sb/webapp-core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { Skeleton } from '@sb/webapp-core/components/ui/skeleton';
import { Locale, DEFAULT_LOCALE } from '@sb/webapp-core/config/i18n';
import { useLocales, useAvailableLocales } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { Globe, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { HTMLAttributes, useState, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useLocation } from 'react-router-dom';

export type LanguageSwitcherProps = HTMLAttributes<HTMLDivElement>;

/**
 * Language switcher dropdown component.
 *
 * Displays the current language with a structured button:
 * [ Globe | Separator | Flag + Language Name + Arrow ]
 * 
 * Fetches available locales from the API dynamically.
 */
export const LanguageSwitcher = (props: LanguageSwitcherProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const location = useLocation();
  const { locales: localeContext, setLanguage } = useLocales();
  const { locales: availableLocales, getFlag } = useAvailableLocales();
  const [isOpen, setIsOpen] = useState(false);

  // Get list of available locale codes for path validation
  const availableLocaleCodes = useMemo(
    () => availableLocales.map((l) => l.code),
    [availableLocales]
  );

  const currentLocale = localeContext.language || DEFAULT_LOCALE;
  const currentLocaleInfo = availableLocales.find((l) => l.code === currentLocale);

  const handleLanguageChange = (code: string) => {
    if (code === currentLocale) return;

    const pathParts = location.pathname.split('/');

    // Check if the first path segment is a known locale code
    if (pathParts.length > 1 && availableLocaleCodes.includes(pathParts[1])) {
      pathParts[1] = code;
    } else if (pathParts.length > 1) {
      // If no locale in path, insert it
      pathParts.splice(1, 0, code);
    }

    const newPath = pathParts.join('/') || `/${code}`;

    setLanguage(code as Locale);
    navigate(newPath + location.search, { replace: true });
  };

  const ArrowIcon = isOpen ? ChevronUp : ChevronDown;

  return (
    <div {...props} className={cn('flex items-center', props.className)}>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'h-9 gap-0 px-0 rounded-lg border border-border',
              'hover:bg-accent hover:text-accent-foreground',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              'transition-all duration-150'
            )}
            aria-label={intl.formatMessage({
              id: 'Header / Language switcher aria label',
              defaultMessage: 'Change language',
            })}
          >
            {/* Globe icon section */}
            <span className="flex items-center justify-center px-2.5">
              <Globe className="h-4 w-4 text-muted-foreground" />
            </span>

            {/* Separator */}
            <span className="h-5 w-px bg-border" aria-hidden="true" />

            {/* Flag + Language + Arrow section */}
            <span className="flex items-center gap-2 px-2.5">
              <span className="text-base leading-none" role="img" aria-hidden="true">
                {getFlag(currentLocale)}
              </span>
              <span className="text-sm font-medium hidden sm:inline">
                {currentLocaleInfo?.native_name || <Skeleton className="h-4 w-14" />}
              </span>
              <ArrowIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52" sideOffset={8}>
          {availableLocales.map((locale) => {
            const isActive = locale.code === currentLocale;

            return (
              <DropdownMenuItem
                key={locale.code}
                onClick={() => handleLanguageChange(locale.code)}
                className={cn(
                  'cursor-pointer gap-3 py-2.5',
                  isActive && 'bg-accent'
                )}
              >
                <span className="text-lg" role="img" aria-label={locale.name}>
                  {getFlag(locale.code)}
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{locale.native_name}</span>
                  <span className="text-xs text-muted-foreground">{locale.name}</span>
                </div>
                {isActive && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
