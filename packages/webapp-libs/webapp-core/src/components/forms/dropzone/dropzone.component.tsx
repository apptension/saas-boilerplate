import { ReactNode } from 'react';
import ReactDropzone, { DropzoneProps as ReactDropzoneProps } from 'react-dropzone';
import { FormattedMessage } from 'react-intl';

import { useGenerateErrorMessages } from './dropzone.hooks';
import { Container, Text } from './dropzone.styles';
import { ErrorMessagesRecord } from './dropzone.types';
import { useToast } from '@sb/webapp-core/toast/useToast';

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
        <Container {...getRootProps()} isDragActive={isDragActive} disabled={disabled}>
          <input {...getInputProps()} data-testid="file-input" />
          <Text>
            {label ?? (
              <FormattedMessage defaultMessage="Drop files here or click to select" id="Dropzone / Default label" />
            )}
          </Text>
        </Container>
      )}
    </ReactDropzone>
  );
};
