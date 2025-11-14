import { Button } from '@sb/webapp-core/components/ui/button';
import { cn } from '@sb/webapp-core/lib/utils';
import { Menu } from 'lucide-react';
import { HTMLAttributes, useContext } from 'react';
import { useIntl } from 'react-intl';

import { LayoutContext } from '../layout.context';
import { UserMenu } from './userMenu';

export type HeaderProps = HTMLAttributes<HTMLElement>;

export const Header = (props: HeaderProps) => {
  const intl = useIntl();
  const { setSideMenuOpen, isSideMenuOpen, isSidebarAvailable } = useContext(LayoutContext);

  return (
    <header {...props} className={cn('sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm', props.className)}>
      <div className="flex h-16 flex-row items-center gap-x-4 px-4 sm:px-6 lg:px-8">
        {isSidebarAvailable && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSideMenuOpen(true)}
            aria-expanded={isSideMenuOpen}
            aria-label={intl.formatMessage({
              id: 'Header / Home menu link aria label',
              defaultMessage: 'Open menu',
            })}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-1"></div>
        <UserMenu />
      </div>
    </header>
  );
};
