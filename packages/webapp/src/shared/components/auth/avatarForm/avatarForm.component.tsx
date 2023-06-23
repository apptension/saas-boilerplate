import cameraIcon from '@iconify-icons/ion/camera-outline';
import { Icon } from '@sb/webapp-core/components/icons';
import { Small } from '@sb/webapp-core/components/typography';
import { cn } from '@sb/webapp-core/lib/utils';
import { FieldError } from 'react-hook-form';

import { Avatar } from '../../avatar';
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
    <div>
      <div className="relative mb-0 h-20 w-20 md:mb-4 ">
        <label
          tabIndex={0}
          className={cn(
            'absolute -left-2 -top-2 z-[1] flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-secondary'
          )}
        >
          <Icon icon={cameraIcon} size={18} />
          <input
            className="hidden"
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
        </label>
        <Avatar className="h-20 w-20" />
      </div>

      <Small className="static m-0 text-left text-red-500">{(errors.avatar as FieldError)?.message}</Small>
    </div>
  );
};
