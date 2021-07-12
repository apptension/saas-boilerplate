import cameraIcon from '@iconify-icons/ion/camera-outline';
import { useIntl } from 'react-intl';
import { FieldError } from 'react-hook-form';
import { useApiForm } from '../../../hooks/useApiForm';
import { Icon } from '../../icon';
import { updateAvatar } from '../../../../modules/auth/auth.actions';
import { useAsyncDispatch } from '../../../utils/reduxSagaPromise';
import { useSnackbar } from '../../snackbar';
import { useFormatFileSize } from '../../fileSize';
import { UpdateAvatarFormFields } from './avatarForm.types';
import { Container, Avatar, IconContainer, FileInput, Message } from './avatarForm.styles';
import { MAX_AVATAR_SIZE } from './avatarForm.constants';

export const AvatarForm = () => {
  const intl = useIntl();
  const dispatch = useAsyncDispatch();
  const snackbar = useSnackbar();
  const formatFileSize = useFormatFileSize();

  const fileTooLargeMessage = intl.formatMessage(
    {
      defaultMessage: 'File cannot be larger than {size}',
      description: 'Auth / Avatar Form / Error / Too large',
    },
    {
      size: formatFileSize(MAX_AVATAR_SIZE),
    }
  );

  const {
    register,
    handleSubmit,
    setValue,
    setApiResponse,
    reset,
    formState: { errors },
  } = useApiForm<UpdateAvatarFormFields>({
    defaultValues: {
      avatar: null,
    },
    errorMessages: {
      avatar: {
        too_large: fileTooLargeMessage,
      },
    },
  });

  const submit = handleSubmit(async (avatarForm: UpdateAvatarFormFields) => {
    try {
      const res = await dispatch(updateAvatar({ avatar: avatarForm.avatar?.[0] ?? null }));
      setApiResponse(res);
      if (!res.isError) {
        reset();
        snackbar.showMessage(
          intl.formatMessage({
            defaultMessage: 'Avatar successfully changed.',
            description: 'Auth / Avatar Form / Success message',
          })
        );
      }
    } catch {}
  });

  return (
    <>
      <Container>
        <IconContainer>
          <Icon icon={cameraIcon} size={18} />
          <FileInput
            {...register('avatar', {
              validate: (files) => {
                const file = files?.[0];
                if (!file) return true;

                return file.size > MAX_AVATAR_SIZE ? fileTooLargeMessage : true;
              },
            })}
            data-testid="file-input"
            accept="image/*"
            size={MAX_AVATAR_SIZE}
            type="file"
            onChange={async (event) => {
              setValue('avatar', event.target.files);
              await submit();
            }}
          />
        </IconContainer>
        <Avatar />
      </Container>

      <Message>{(errors.avatar as FieldError)?.message}</Message>
    </>
  );
};
