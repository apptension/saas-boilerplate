import { Link } from '@sb/webapp-core/components/buttons';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@sb/webapp-core/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@sb/webapp-core/components/ui/tooltip';
import { cn } from '@sb/webapp-core/lib/utils';
import { ChevronDown, ChevronRight, Construction } from 'lucide-react';
import { ReactNode, useState } from 'react';

export type ExpandableMenuDivider = {
  type: 'divider';
  label: string;
};

export type ExpandableMenuLink = {
  type?: 'link';
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  generatePath: () => string;
  permissions?: string[]; // Permission codes for RBAC
};

export type ExpandableMenuItem = ExpandableMenuLink | ExpandableMenuDivider;

export type SidebarExpandableItemProps = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ExpandableMenuItem[];
  isActive: (path: string) => boolean;
  isCollapsed: boolean;
  isDesktop: boolean;
  onItemClick: () => void;
  defaultOpen?: boolean;
};

const isMenuLink = (item: ExpandableMenuItem): item is ExpandableMenuLink => {
  return item.type !== 'divider';
};

export const SidebarExpandableItem = ({
  label,
  icon: Icon,
  items,
  isActive,
  isCollapsed,
  isDesktop,
  onItemClick,
  defaultOpen = false,
}: SidebarExpandableItemProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const hasActiveChild = items.filter(isMenuLink).some((item) => isActive(item.path));

  const menuItemClassName = (active: boolean) =>
    cn(
      'flex items-center rounded-md text-sm font-medium transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      {
        'justify-center px-0 py-2.5': isCollapsed && isDesktop,
        'gap-3 px-3 py-2.5': !isCollapsed || !isDesktop,
        'bg-accent text-accent-foreground': active,
        'text-muted-foreground': !active,
      }
    );

  const subItemClassName = (active: boolean) =>
    cn(
      'flex items-center rounded-md text-sm font-medium transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'gap-3 pl-11 pr-3 py-2',
      {
        'bg-accent/50 text-accent-foreground': active,
        'text-muted-foreground': !active,
      }
    );

  // Collapsed state - show icon with tooltip and dropdown on hover
  if (isCollapsed && isDesktop) {
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            className={menuItemClassName(hasActiveChild)}
            onClick={() => setIsOpen(!isOpen)}
          >
            <Icon className="h-5 w-5 shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="right"
          align="start"
          sideOffset={8}
          className="w-52 p-0 overflow-hidden rounded-lg border border-border/50 bg-popover shadow-lg"
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-b border-border/50 bg-muted/30">
            <Icon className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm text-foreground">{label}</span>
          </div>
          {/* Menu Items */}
          <div className="flex flex-col py-1.5 max-h-80 overflow-y-auto">
            {items.map((item, index) => {
              // Render divider
              if (item.type === 'divider') {
                return (
                  <div key={`divider-${index}`} className="mx-1.5 my-1.5">
                    <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-500">
                      <Construction className="h-3.5 w-3.5" />
                      <span>{item.label}</span>
                    </div>
                    <div className="border-t border-border/50" />
                  </div>
                );
              }
              // Render link
              const SubIcon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.generatePath()}
                  onClick={onItemClick}
                  navLink
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded-md text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {SubIcon && <SubIcon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground/70')} />}
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded state - show collapsible menu
  return (
    <Collapsible open={isOpen || hasActiveChild} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className={cn(menuItemClassName(hasActiveChild), 'w-full justify-between pr-3')}>
          <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 shrink-0" />
            <span className="truncate">{label}</span>
          </div>
          {isOpen || hasActiveChild ? (
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
          )}
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-0.5 mt-1">
        {items.map((item, index) => {
          // Render divider
          if (item.type === 'divider') {
            return (
              <div key={`divider-${index}`} className="pl-11 pr-3 py-2 mt-1">
                <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-500 mb-1.5">
                  <Construction className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
                <div className="border-t border-border/50" />
              </div>
            );
          }
          // Render link
          const SubIcon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.generatePath()}
              onClick={onItemClick}
              navLink
              className={subItemClassName(isActive(item.path))}
            >
              {SubIcon && <SubIcon className="h-4 w-4 shrink-0" />}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
};
