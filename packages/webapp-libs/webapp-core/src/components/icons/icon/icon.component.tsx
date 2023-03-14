import { ComponentProps } from 'react';
import { Icon as IconifyIcon } from '@iconify/react';
import { Container } from './icon.styles';

export type IconProps = {
  icon: ComponentProps<typeof IconifyIcon>['icon'];
  className?: string;
  size?: number;
};

export const Icon = ({ icon, className, size }: IconProps) => {
  return <Container icon={icon} className={className} size={size ?? 24} />;
};
