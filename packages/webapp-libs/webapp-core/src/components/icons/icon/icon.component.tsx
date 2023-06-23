import { Icon as IconifyIcon } from '@iconify/react';
import { ComponentProps } from 'react';

export type IconProps = {
  icon: ComponentProps<typeof IconifyIcon>['icon'];
  className?: string;
  size?: number;
};

export const Icon = ({ icon, className, size }: IconProps) => {
  return <IconifyIcon icon={icon} className={className} style={{ fontSize: size ?? 24 }} />;
};
