import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';

interface ImgThemedProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  srcDark: string;
}

const ImgThemed = ({ srcDark, ...props }: ImgThemedProps) => {
  const { colorMode } = useColorMode();

  return <img {...props} src={colorMode === 'dark' ? srcDark : props.src} />;
};

export default ImgThemed;
