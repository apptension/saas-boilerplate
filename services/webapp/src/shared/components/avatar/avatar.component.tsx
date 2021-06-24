import React, { HTMLAttributes } from 'react';
import { useSelector } from 'react-redux';
import { selectProfileInitial } from '../../../modules/auth/auth.selectors';
import { sizeUnitBase } from '../../../theme/size';
import { Container } from './avatar.styles';

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export const Avatar = ({ size, ...props }: AvatarProps) => {
  const initial = useSelector(selectProfileInitial);
  return (
    <Container size={size ?? 4 * sizeUnitBase} {...props}>
      {initial}
    </Container>
  );
};
