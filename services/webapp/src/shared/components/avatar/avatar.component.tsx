import { HTMLAttributes } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { isNil } from 'ramda';
import { selectProfileAvatar, selectProfileInitial } from '../../../modules/auth/auth.selectors';
import { sizeUnitBase } from '../../../theme/size';
import { Container, Image } from './avatar.styles';

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export const Avatar = ({ size, ...props }: AvatarProps) => {
  const intl = useIntl();

  const initial = useSelector(selectProfileInitial);
  const avatar = useSelector(selectProfileAvatar);

  return (
    <Container size={size ?? 4 * sizeUnitBase} hasImage={!isNil(avatar)} {...props}>
      {!isNil(avatar) ? (
        <Image
          src={avatar}
          alt={intl.formatMessage({ defaultMessage: 'user avatar', description: 'Avatar / Image alt' })}
        />
      ) : (
        initial
      )}
    </Container>
  );
};
