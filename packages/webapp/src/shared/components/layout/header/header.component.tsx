import { Link as ButtonLink, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Popover, PopoverContent, PopoverTrigger } from '@sb/webapp-core/components/popover';
import { useGenerateLocalePath, useOpenState } from '@sb/webapp-core/hooks';
import { cn } from '@sb/webapp-core/lib/utils';
import { Notifications } from '@sb/webapp-notifications';
import { HTMLAttributes, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { RoutesConfig } from '../../../../app/config/routes';
import notificationTemplates from '../../../constants/notificationTemplates';
import { useAuth } from '../../../hooks';
import { LayoutContext } from '../layout.context';
import { Avatar, Menu, MenuLine, ProfileActions } from './header.styles';

export type HeaderProps = HTMLAttributes<HTMLElement>;

export const Header = (props: HeaderProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const { setSideMenuOpen, isSideMenuOpen, isSidebarAvailable } = useContext(LayoutContext);
  const userDropdown = useOpenState(false);
  const { isLoggedIn } = useAuth();

  return (
    <header
      {...props}
      className={cn(
        'sticky top-0 drop-shadow bg-primary-foreground/90 backdrop-blur-sm ring-1 ring-slate-800/10',
        props.className
      )}
    >
      <div className="flex flex-row h-16 px-8 gap-x-6 items-center justify-end">
        {isSidebarAvailable && (
          <div
            className="block lg:hidden w-6 cursor-pointer justify-self-start"
            role="button"
            tabIndex={0}
            onClick={() => setSideMenuOpen(true)}
            aria-expanded={isSideMenuOpen}
            aria-label={intl.formatMessage({
              id: 'Header / Home menu link aria label',
              defaultMessage: 'Open menu',
            })}
          >
            <MenuLine />
            <MenuLine />
            <MenuLine />
          </div>
        )}

        <div className="flex-1"></div>

        {isLoggedIn && (
          <>
            <Notifications templates={notificationTemplates} />

            <ProfileActions>
              <Popover
                open={userDropdown.isOpen}
                onOpenChange={(open) => {
                  userDropdown.setIsOpen(open);
                }}
              >
                <PopoverTrigger>
                  <Avatar
                    onClick={userDropdown.toggle}
                    tabIndex={0}
                    aria-expanded={userDropdown.isOpen}
                    aria-label={intl.formatMessage({
                      id: 'Header / Open profile menu aria label',
                      defaultMessage: 'Open profile menu',
                    })}
                  />
                </PopoverTrigger>

                <PopoverContent asChild align="end" side="bottom" sideOffset={24}>
                  <Menu>
                    <ButtonLink
                      onClick={userDropdown.close}
                      to={generateLocalePath(RoutesConfig.profile)}
                      variant={ButtonVariant.SECONDARY}
                    >
                      <FormattedMessage defaultMessage="Profile" id="Header / Profile button" />
                    </ButtonLink>
                    <ButtonLink
                      onClick={userDropdown.close}
                      to={generateLocalePath(RoutesConfig.logout)}
                      variant={ButtonVariant.SECONDARY}
                    >
                      <FormattedMessage defaultMessage="Log out" id="Header / Logout button" />
                    </ButtonLink>
                  </Menu>
                </PopoverContent>
              </Popover>
            </ProfileActions>
          </>
        )}
      </div>
    </header>
  );
};
