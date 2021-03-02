import React, { ComponentProps } from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

import { Container } from './icon.styles';
export interface IconProps {
  icon: ComponentProps<typeof IconifyIcon>['icon'];
  className?: string;
}

export const Icon = ({ icon, className }: IconProps) => {
  return <Container icon={icon} className={className} />;
};
