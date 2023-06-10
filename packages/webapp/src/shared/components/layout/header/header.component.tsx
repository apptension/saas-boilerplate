import { Link as ButtonLink, ButtonVariant } from '@sb/webapp-core/components/buttons';
import { Popover, PopoverContent, PopoverTrigger } from '@sb/webapp-core/components/popover';
import { useGenerateLocalePath, useMediaQuery, useOpenState } from '@sb/webapp-core/hooks';
import { Snackbar } from '@sb/webapp-core/snackbar';
import { media } from '@sb/webapp-core/theme';
import { Notifications } from '@sb/webapp-notifications';
import { HTMLAttributes, useContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { RoutesConfig } from '../../../../app/config/routes';
import notificationTemplates from '../../../constants/notificationTemplates';
import { useAuth } from '../../../hooks';
import { LayoutContext } from '../layout.context';
import {
  Avatar,
  Container,
  Content,
  HeaderLogo,
  Menu,
  MenuContainer,
  MenuLine,
  MenuToggleButton,
  ProfileActions,
  SnackbarMessages,
} from './header.styles';

export type HeaderProps = HTMLAttributes<HTMLElement>;

export const Header = (props: HeaderProps) => {
  const intl = useIntl();
  const generateLocalePath = useGenerateLocalePath();
  const { setSideMenuOpen, isSideMenuOpen, isSidebarAvailable } = useContext(LayoutContext);
  const { matches: isDesktop } = useMediaQuery({ above: media.Breakpoint.TABLET });
  const userDropdown = useOpenState(false);
  const { isLoggedIn } = useAuth();

  return (
    <Container {...props}>
      <Content>
        {isSidebarAvailable && !isDesktop && (
          <MenuToggleButton
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
          </MenuToggleButton>
        )}

        <MenuContainer>
          <Link
            to={generateLocalePath(RoutesConfig.home)}
            aria-label={intl.formatMessage({
              id: 'Header / Home link aria label',
              defaultMessage: 'Go back home',
            })}
          >
            <HeaderLogo />
          </Link>
        </MenuContainer>

        <SnackbarMessages>
          <Snackbar />
        </SnackbarMessages>

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
      </Content>
    </Container>
  );
};
