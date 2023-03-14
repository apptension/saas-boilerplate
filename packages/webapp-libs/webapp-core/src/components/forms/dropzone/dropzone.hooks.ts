import { useMemo } from 'react';
import { FileRejection } from 'react-dropzone';
import { useIntl } from 'react-intl';

import { useFormatFileSize } from '../../fileSize';
import { DropzoneProps } from './dropzone.component';
import { ErrorCodes, ErrorMessagesRecord } from './dropzone.types';

export const useGenerateErrorMessages = ({
  maxSize,
  minSize,
  maxFiles,
  errorMessages,
}: Pick<DropzoneProps, 'maxSize' | 'minSize' | 'maxFiles' | 'errorMessages'>) => {
  const intl = useIntl();
  const formatFileSize = useFormatFileSize();

  const messages = useMemo<ErrorMessagesRecord>(
    () => ({
      [ErrorCodes.FILE_TOO_LARGE]: (file) =>
        intl.formatMessage(
          {
            id: 'Dropzone / Error messages / File too large',
            defaultMessage: 'File {fileName} is larger than {maxSize}',
          },
          {
            maxSize: maxSize ? formatFileSize(maxSize) : '',
            fileName: file.name,
          }
        ),
      [ErrorCodes.FILE_TOO_SMALL]: (file) =>
        intl.formatMessage(
          {
            id: 'Dropzone / Error messages / File too small',
            defaultMessage: 'File {fileName} is smaller than {minSize}',
          },
          {
            minSize: minSize ? formatFileSize(minSize) : '',
            fileName: file.name,
          }
        ),
      [ErrorCodes.TOO_MANY_FILES]: () =>
        intl.formatMessage(
          {
            id: 'Dropzone / Error messages / Too many files',
            defaultMessage: 'Cannot accept more than {maxFiles} file',
          },
          {
            maxFiles,
          }
        ),
      [ErrorCodes.FILE_INVALID_TYPE]: (file) =>
        intl.formatMessage(
          {
            id: 'Dropzone / Error messages / File invalid type',
            defaultMessage: 'File {fileName} type cannot be accepted',
          },
          {
            fileName: file.name,
          }
        ),
      [ErrorCodes.GENERIC]: (file) =>
        intl.formatMessage(
          {
            id: 'Dropzone / Error messages / Generic',
            defaultMessage: 'File {fileName} cannot be accepted',
          },
          {
            fileName: file.name,
          }
        ),
      ...errorMessages,
    }),
    [errorMessages, formatFileSize, intl, maxFiles, maxSize, minSize]
  );

  return (rejectedFiles: FileRejection[]) =>
    rejectedFiles
      .map(({ file, errors }) =>
        errors.map((error) => {
          const generator = messages[error.code] ?? messages[ErrorCodes.GENERIC];
          return generator(file);
        })
      )
      .flat();
};
