import ReactDropzone, { DropzoneProps as ReactDropzoneProps } from 'react-dropzone';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Container, Text } from './dropzone.styles';

export type DropzoneProps = ReactDropzoneProps & {
  label?: ReactNode;
};

export const Dropzone = ({ label, ...props }: DropzoneProps) => {
  return (
    <ReactDropzone {...props}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <Container {...getRootProps()} isDragActive={isDragActive}>
          <input {...getInputProps()} />
          <Text>
            {label ?? (
              <FormattedMessage
                defaultMessage="Drop files here or click to select"
                description="Dropzone / Default label"
              />
            )}
          </Text>
        </Container>
      )}
    </ReactDropzone>
  );
};
