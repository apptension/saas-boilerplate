import React, { HTMLAttributes } from 'react';

import { useSelector } from 'react-redux';
import { selectProfileInitial } from '../../../modules/auth/auth.selectors';
import { sizeUnitBase } from '../../../theme/size';
import { Container } from './avatar.styles';

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

export const Avatar = (props: AvatarProps) => {
  const initial = useSelector(selectProfileInitial);
  return (
    <Container size={props.size ?? 4 * sizeUnitBase} {...props}>
      {initial}
    </Container>
  );
};
