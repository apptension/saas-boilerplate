import { ReactNode } from 'react';

export type RenderIconProps = {
  icon: ReactNode;
};

export const renderIcon = ({ icon }: RenderIconProps) => icon && <span className="mr-1">{icon}</span>;
