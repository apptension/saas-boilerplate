import { CloudUpload } from 'lucide-react';
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
            'group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-all duration-200',
            'bg-muted/30 hover:bg-muted/50',
            'border-muted-foreground/25 hover:border-primary/50',
            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2',
            {
              'cursor-not-allowed opacity-50': disabled,
              'cursor-pointer': !disabled,
              'border-primary bg-primary/5 ring-2 ring-primary/20': isDragActive,
            }
          )}
        >
          <input {...getInputProps()} data-testid="file-input" />
          
          <div
            className={cn(
              'mb-4 flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200',
              'bg-muted group-hover:bg-primary/10',
              {
                'bg-primary/10 scale-110': isDragActive,
              }
            )}
          >
            <CloudUpload
              className={cn(
                'h-7 w-7 transition-all duration-200',
                'text-muted-foreground group-hover:text-primary',
                {
                  'text-primary': isDragActive,
                }
              )}
            />
          </div>
          
          <div className="text-center">
            <p
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                'text-foreground/80 group-hover:text-foreground',
                {
                  'text-primary': isDragActive,
                }
              )}
            >
              {isDragActive ? (
                <FormattedMessage
                  defaultMessage="Drop your file here"
                  id="Dropzone / Drop active label"
                />
              ) : (
                <FormattedMessage
                  defaultMessage="Drag & drop your file here"
                  id="Dropzone / Drag label"
                />
              )}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {label ?? (
                <FormattedMessage
                  defaultMessage="or click to browse from your device"
                  id="Dropzone / Default label"
                />
              )}
            </p>
          </div>
        </div>
      )}
    </ReactDropzone>
  );
};
