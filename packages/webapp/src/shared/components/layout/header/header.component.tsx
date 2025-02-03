import { useCommonQuery } from '@sb/webapp-api-client/providers';
import { Button, Link as ButtonLink, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Popover, PopoverContent, PopoverTrigger } from '@sb/webapp-core/components/ui/popover';
import { useGenerateLocalePath, useOpenState } from '@sb/webapp-core/hooks';
import { useTheme } from '@sb/webapp-core/hooks/useTheme/useTheme';
import { cn } from '@sb/webapp-core/lib/utils';
import { Notifications } from '@sb/webapp-notifications';
import { TenantSwitch } from '@sb/webapp-tenants/components/tenantSwitch';
import { LogOut, Menu, Sun, User } from 'lucide-react';
import { HTMLAttributes, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../app/config/routes';
import notificationTemplates from '../../../constants/notificationTemplates';
import getNotificationEvents from '../../../events/notificationEvents';
import { useAuth } from '../../../hooks';
import { Avatar } from '../../avatar';
import { LayoutContext } from '../layout.context';

export type HeaderProps = HTMLAttributes<HTMLElement>;

export const Header = (props: HeaderProps) => {
  const intl = useIntl();
  const { isLoggedIn, currentUser } = useAuth();
  const { toggleTheme } = useTheme();
  const userDropdown = useOpenState(false);
  const generateLocalePath = useGenerateLocalePath();
  const { setSideMenuOpen, isSideMenuOpen, isSidebarAvailable } = useContext(LayoutContext);
  const { reload: reloadCommonQuery } = useCommonQuery();
  const events = getNotificationEvents({ reloadCommonQuery });

  return (
    <header {...props} className={cn('sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm', props.className)}>
      <div className="flex h-16 flex-row items-center justify-end gap-x-4 px-8">
        {isSidebarAvailable && (
          <div
            className="block w-6 cursor-pointer justify-self-start lg:hidden"
            role="button"
            tabIndex={0}
            onClick={() => setSideMenuOpen(true)}
            aria-expanded={isSideMenuOpen}
            aria-label={intl.formatMessage({
              id: 'Header / Home menu link aria label',
              defaultMessage: 'Open menu',
            })}
          >
            <Menu />
          </div>
        )}

        {isLoggedIn && <TenantSwitch />}

        <div className="flex-1"></div>

        <Button variant="ghost" onClick={() => toggleTheme()} className="h-10 w-10 rounded-full px-0">
          <Sun />
        </Button>

        {isLoggedIn && (
          <>
            <Notifications key={currentUser?.id ?? 'default'} templates={notificationTemplates} events={events} />

            <div className="relative ml-2 hidden md:block">
              <Popover
                open={userDropdown.isOpen}
                onOpenChange={(open) => {
                  userDropdown.setIsOpen(open);
                }}
              >
                <PopoverTrigger>
                  <Avatar
                    className="cursor-pointer"
                    onClick={userDropdown.toggle}
                    tabIndex={0}
                    aria-expanded={userDropdown.isOpen}
                    aria-label={intl.formatMessage({
                      id: 'Header / Open profile menu aria label',
                      defaultMessage: 'Open profile menu',
                    })}
                  />
                </PopoverTrigger>

                <PopoverContent className="w-48 p-2" asChild align="end" side="bottom" sideOffset={24}>
                  <div className="top-10 flex flex-col overflow-hidden rounded">
                    <ButtonLink
                      onClick={userDropdown.close}
                      to={generateLocalePath(RoutesConfig.profile)}
                      variant={ButtonVariant.GHOST}
                      icon={<User size={20} />}
                      className="justify-start"
                    >
                      <FormattedMessage defaultMessage="Profile" id="Header / Profile button" />
                    </ButtonLink>
                    <ButtonLink
                      onClick={userDropdown.close}
                      to={generateLocalePath(RoutesConfig.logout)}
                      variant={ButtonVariant.GHOST}
                      className="justify-start"
                      icon={<LogOut size={20} />}
                    >
                      <FormattedMessage defaultMessage="Log out" id="Header / Logout button" />
                    </ButtonLink>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
      </div>
    </header>
  );
};
