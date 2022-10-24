import ReactDropzone, { DropzoneProps as ReactDropzoneProps } from 'react-dropzone';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';

import { useSnackbar } from '../../../../modules/snackbar';
import { Container, Text } from './dropzone.styles';
import { ErrorMessagesRecord } from './dropzone.types';
import { useGenerateErrorMessages } from './dropzone.hooks';

export type DropzoneProps = ReactDropzoneProps & {
  label?: ReactNode;
  errorMessages?: ErrorMessagesRecord;
};

export const Dropzone = ({ label, disabled, onDrop, ...props }: DropzoneProps) => {
  const snackbar = useSnackbar();
  const generateErrorMessages = useGenerateErrorMessages(props);

  const handleDrop: ReactDropzoneProps['onDrop'] = (files, fileRejection, event) => {
    generateErrorMessages(fileRejection).forEach((error) => {
      snackbar.showMessage(error);
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
