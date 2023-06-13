import { Avatar as AvatarContainer, AvatarFallback, AvatarImage } from '@sb/webapp-core/components/avatar';
import { cn } from '@sb/webapp-core/lib/utils';
import { isNil } from 'ramda';
import { HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

import { useAuth } from '../../hooks';
import { ProfileInitial } from '../profileInitial';

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number;
};

export const Avatar = ({ size, ...props }: AvatarProps) => {
  const intl = useIntl();
  const { currentUser } = useAuth();

  const avatar = currentUser?.avatar;

  return (
    <AvatarContainer {...props} className={cn(`w-[${size ? size : 40}px] h-[${size ? size : 40}px]`, props.className)}>
      <AvatarImage
        src={isNil(avatar) ? undefined : avatar}
        alt={intl.formatMessage({ defaultMessage: 'user avatar', id: 'Avatar / Image alt' })}
      />
      <AvatarFallback>
        <ProfileInitial profile={currentUser} />
      </AvatarFallback>
    </AvatarContainer>
  );
};
