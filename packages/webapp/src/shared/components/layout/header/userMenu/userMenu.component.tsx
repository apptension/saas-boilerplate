import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Link as ButtonLink } from '@sb/webapp-core/components/buttons';
import { ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Button } from '@sb/webapp-core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@sb/webapp-core/components/ui/dropdown-menu';
import { useGenerateLocalePath } from '@sb/webapp-core/hooks';
import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { cn } from '@sb/webapp-core/lib/utils';
import { Themes } from '@sb/webapp-core/providers/themeProvider';
import { Notifications } from '@sb/webapp-notifications';
import { LogOut, Moon, Sun, User } from 'lucide-react';
import { HTMLAttributes } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../../app/config/routes';
import notificationTemplates from '../../../../constants/notificationTemplates';
import getNotificationEvents from '../../../../events/notificationEvents';
import { useAuth } from '../../../../hooks';
import { Avatar } from '../../../avatar';

export type UserMenuProps = HTMLAttributes<HTMLDivElement>;

export const UserMenu = (props: UserMenuProps) => {
  const intl = useIntl();
  const { currentUser, isLoggedIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const generateLocalePath = useGenerateLocalePath();
  const { reload: reloadCommonQuery } = useCommonQuery();
  const events = getNotificationEvents({ reloadCommonQuery });

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  return (
    <div {...props} className={cn('flex items-center gap-2', props.className)}>
      <Notifications key={currentUser.id ?? 'default'} templates={notificationTemplates} events={events} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              'relative h-9 w-9 rounded-full p-0 transition-all',
              'hover:ring-2 hover:ring-ring hover:ring-offset-2 hover:ring-offset-background',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'data-[state=open]:ring-2 data-[state=open]:ring-ring data-[state=open]:ring-offset-2 data-[state=open]:ring-offset-background'
            )}
            aria-label={intl.formatMessage({
              id: 'Header / Open user menu aria label',
              defaultMessage: 'Open user menu',
            })}
          >
            <Avatar className="h-9 w-9 cursor-pointer transition-all hover:scale-105" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-10 w-10 shrink-0" />
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium leading-none">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="mt-1 truncate text-xs leading-none text-muted-foreground">{currentUser.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer gap-2" onSelect={(e) => e.preventDefault()}>
            {theme === Themes.DARK ? (
              <>
                <Sun className="h-4 w-4 shrink-0" />
                <span>
                  <FormattedMessage defaultMessage="Light mode" id="Header / Light mode" />
                </span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 shrink-0" />
                <span>
                  <FormattedMessage defaultMessage="Dark mode" id="Header / Dark mode" />
                </span>
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="cursor-pointer gap-2">
            <ButtonLink
              to={generateLocalePath(RoutesConfig.profile)}
              variant={ButtonVariant.GHOST}
              className="w-full justify-start"
            >
              <User className="h-4 w-4 shrink-0" />
              <span>
                <FormattedMessage defaultMessage="Edit profile" id="Header / Edit profile" />
              </span>
            </ButtonLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            asChild
            className="cursor-pointer gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
          >
            <ButtonLink
              to={generateLocalePath(RoutesConfig.logout)}
              variant={ButtonVariant.GHOST}
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>
                <FormattedMessage defaultMessage="Log out" id="Header / Log out" />
              </span>
            </ButtonLink>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
