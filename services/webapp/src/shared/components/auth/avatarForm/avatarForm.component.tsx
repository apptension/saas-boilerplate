import cameraIcon from '@iconify-icons/ion/camera-outline';
import { FieldError } from 'react-hook-form';

import { Icon } from '../../icon';
import { Container, Avatar, IconContainer, FileInput, Message } from './avatarForm.styles';
import { MAX_AVATAR_SIZE } from './avatarForm.constants';
import { useAvatarForm } from './avatarForm.hooks';

export const AvatarForm = () => {
  const {
    form: {
      formState: { errors },
      register,
    },
    handleAvatarUpload,
    fileTooLargeMessage,
  } = useAvatarForm();

  const avatarField = register('avatar', {
    validate: (files) => {
      const file = files?.[0];
      if (!file) return true;

      return file.size > MAX_AVATAR_SIZE ? fileTooLargeMessage : true;
    },
  });
  return (
    <>
      <Container>
        <IconContainer>
          <Icon icon={cameraIcon} size={18} />
          <FileInput
            {...avatarField}
            data-testid="file-input"
            accept="image/*"
            size={MAX_AVATAR_SIZE}
            type="file"
            onChange={async (event) => {
              await avatarField.onChange(event);
              await handleAvatarUpload();
            }}
          />
        </IconContainer>
        <Avatar />
      </Container>

      <Message>{(errors.avatar as FieldError)?.message}</Message>
    </>
  );
};
