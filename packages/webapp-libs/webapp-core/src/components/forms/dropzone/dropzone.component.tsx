import { Upload } from 'lucide-react';
import { ReactNode } from 'react';
import ReactDropzone, { DropzoneProps as ReactDropzoneProps } from 'react-dropzone';
import { FormattedMessage } from 'react-intl';

import { cn } from '../../../lib/utils';
import { useToast } from '../../../toast';
import { useGenerateErrorMessages } from './dropzone.hooks';
import { ErrorMessagesRecord } from './dropzone.types';

export type DropzoneProps = ReactDropzoneProps & {
  label?: ReactNode;
  errorMessages?: ErrorMessagesRecord;
};

export const Dropzone = ({ label, disabled, onDrop, ...props }: DropzoneProps) => {
  const { toast } = useToast();
  const generateErrorMessages = useGenerateErrorMessages(props);

  const handleDrop: ReactDropzoneProps['onDrop'] = (files, fileRejection, event) => {
    generateErrorMessages(fileRejection)
      .filter((value, index, array) => array.indexOf(value) === index)
      .forEach((error) => {
        toast({ description: error, variant: 'destructive' });
      });
    onDrop?.(files, fileRejection, event);
  };

  return (
    <ReactDropzone disabled={disabled} onDrop={handleDrop} {...props}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <div
          {...getRootProps()}
          className={cn(
            'border-input group flex items-center justify-center rounded border border-dashed p-8 transition-colors hover:border-blue-300 focus:border-blue-500',
            {
              'cursor-not-allowed': disabled,
              'cursor-pointer': !disabled,
              'border-blue-600': isDragActive,
            }
          )}
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="flex flex-col items-center">
            <Upload
              size={32}
              className={cn('text-muted-foreground mb-4 transition-colors group-focus:text-blue-500', {
                'text-blue-600': isDragActive,
              })}
            />
            <span className="text-muted-foreground transition-colors group-focus:text-blue-500">
              {label ?? (
                <FormattedMessage
                  defaultMessage="Click or drag file to this area to upload"
                  id="Dropzone / Default label"
                />
              )}
            </span>
          </div>
        </div>
      )}
    </ReactDropzone>
  );
};
