import cameraIcon from '@iconify-icons/ion/camera-outline';
import { Icon } from '@sb/webapp-core/components/icons';
import { cn } from '@sb/webapp-core/lib/utils';
import { useToast } from '@sb/webapp-core/toast/useToast';
import { Loader2 } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { useIntl } from 'react-intl';

import { Avatar } from '../../avatar';
import { MAX_AVATAR_SIZE } from './avatarForm.constants';
import { useAvatarForm } from './avatarForm.hooks';

export const AvatarForm = () => {
  const intl = useIntl();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    form: { register },
    handleAvatarUpload,
    fileTooLargeMessage,
    loading,
  } = useAvatarForm();

  const { ref: registerRef, onChange: registerOnChange, ...avatarFieldRest } = register('avatar', {
    validate: (files) => {
      const file = files?.[0];
      if (!file) return true;

      if (file.size > MAX_AVATAR_SIZE) {
        toast({
          description: fileTooLargeMessage,
          variant: 'destructive',
        });
        return fileTooLargeMessage;
      }
      return true;
    },
  });

  // Merge refs: both the register ref and our local ref
  const setInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      registerRef(element);
      fileInputRef.current = element;
    },
    [registerRef]
  );

  const handleClick = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === 'Enter' || event.key === ' ') && !loading) {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="relative">
      <div className="relative h-20 w-20 md:mb-4">
        {/* Camera button */}
        <button
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          disabled={loading}
          aria-label={intl.formatMessage({
            defaultMessage: 'Change profile photo',
            id: 'Auth / Avatar Form / Change photo button',
          })}
          className={cn(
            'absolute -left-2 -top-2 z-[1] flex h-8 w-8 items-center justify-center rounded-full bg-primary text-secondary',
            'transition-all duration-200 ease-in-out',
            'hover:bg-primary/90 hover:scale-105',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            loading && 'cursor-not-allowed opacity-50'
          )}
        >
          <Icon icon={cameraIcon} size={18} />
          <input
            ref={setInputRef}
            className="hidden"
            {...avatarFieldRest}
            data-testid="file-input"
            accept="image/*"
            size={MAX_AVATAR_SIZE}
            type="file"
            onChange={async (event) => {
              await registerOnChange(event);
              await handleAvatarUpload();
              // Reset input so the same file can be selected again
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}
          />
        </button>

        {/* Avatar with loading overlay */}
        <div className="relative h-20 w-20 overflow-hidden rounded-full">
          <Avatar
            className={cn(
              'h-20 w-20 transition-all duration-300 ease-in-out',
              loading && 'opacity-50 blur-[1px]'
            )}
          />

          {/* Loading spinner overlay */}
          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-[1px] animate-in fade-in duration-200"
              data-testid="avatar-loading"
            >
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
