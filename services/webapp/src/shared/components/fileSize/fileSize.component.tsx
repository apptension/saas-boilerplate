import { useFormatFileSize } from './fileSize.hooks';

export type FileSizeProps = {
  size: number;
  decimals?: number;
};

export const FileSize = ({ size, decimals = 2 }: FileSizeProps) => {
  const formatSize = useFormatFileSize();
  return <>{formatSize(size, decimals)}</>;
};
