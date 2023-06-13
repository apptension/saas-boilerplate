import { Avatar as AvatarContainer, AvatarFallback, AvatarImage } from '@sb/webapp-core/components/avatar';
import { isNil } from 'ramda';
import { HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';

import { useAuth } from '../../hooks';
import { ProfileInitial } from '../profileInitial';

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  size?: number;
};

export const Avatar = ({ size = 40, ...props }: AvatarProps) => {
  const intl = useIntl();
  const { currentUser } = useAuth();

  const avatar = currentUser?.avatar;

  return (
    <AvatarContainer {...props} className={`w-[${size}px] h-[${size}px]`}>
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
