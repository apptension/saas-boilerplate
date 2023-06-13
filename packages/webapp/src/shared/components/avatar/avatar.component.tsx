import { Avatar as AvatarContainer, AvatarFallback, AvatarImage } from '@sb/webapp-core/components/avatar';
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
    <AvatarContainer {...props} className={`w-[${size ? size : 40}px] h-[${size ? size : 40}px]`}>
      <AvatarImage
        onLoadingStatusChange={(status) => {
          console.log(status, 'statusstatus');
        }}
        src={isNil(avatar) ? undefined : avatar}
        alt={intl.formatMessage({ defaultMessage: 'user avatar', id: 'Avatar / Image alt' })}
      />
      <AvatarFallback delayMs={2}>
        <ProfileInitial profile={currentUser} />
      </AvatarFallback>
    </AvatarContainer>
  );
};

// 'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/315.jpg'
