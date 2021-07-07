import { useIntl } from 'react-intl';
import { useMemo } from 'react';

export const useFormatFileSize = () => {
  const intl = useIntl();

  const { zeroBytes, generateSizes } = useMemo(
    () => ({
      zeroBytes: intl.formatMessage({
        defaultMessage: '0 bytes',
        description: 'File Size / Bytes',
      }),
      generateSizes: (size: number) => [
        intl.formatMessage({ defaultMessage: '{size} bytes', description: 'File Size / Units / Bytes' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} KB', description: 'File Size / Units / KB' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} MB', description: 'File Size / Units / MB' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} GB', description: 'File Size / Units / GB' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} TB', description: 'File Size / Units / TB' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} PB', description: 'File Size / Units / PB' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} EB', description: 'File Size / Units / EB' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} ZB', description: 'File Size / Units / ZB' }, { size }),
        intl.formatMessage({ defaultMessage: '{size} YB', description: 'File Size / Units / YB' }, { size }),
      ],
    }),
    [intl]
  );

  return (size: number, decimals = 2) => {
    if (size === 0) return zeroBytes;
    const base = 1024;
    const index = Math.floor(Math.log(size) / Math.log(base));
    const formattedSize = parseFloat((size / Math.pow(base, index)).toFixed(decimals));
    return generateSizes(formattedSize)[index];
  };
};
