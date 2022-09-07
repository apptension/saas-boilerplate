import { HTMLAttributes } from 'react';
import { useIntl } from 'react-intl';
import { isNil } from 'ramda';
import { useAuth } from '../../hooks/useAuth/useAuth';
import { sizeUnitBase } from '../../../theme/size';
import { ProfileInitial } from '../profileInitial';
import { Container, Image } from './avatar.styles';

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export const Avatar = ({ size, ...props }: AvatarProps) => {
  const intl = useIntl();
  const { currentUser } = useAuth();

  const avatar = currentUser?.avatar;

  return (
    <Container size={size ?? 4 * sizeUnitBase} hasImage={!isNil(avatar)} {...props}>
      {!isNil(avatar) ? (
        <Image
          src={avatar}
          alt={intl.formatMessage({ defaultMessage: 'user avatar', id: 'Avatar / Image alt' })}
        />
      ) : (
        <ProfileInitial profile={currentUser} />
      )}
    </Container>
  );
};
