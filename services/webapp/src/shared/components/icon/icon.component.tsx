import React, { ComponentProps } from 'react';
import { Icon as IconifyIcon } from '@iconify/react';

import { Container } from './icon.styles';
export interface IconProps {
  icon: ComponentProps<typeof IconifyIcon>['icon'];
}

export const Icon = ({ icon }: IconProps) => {
  return <Container icon={icon} />;
};
