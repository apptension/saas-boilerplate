import { HTMLAttributes } from 'react';

export type ImageProps = HTMLAttributes<HTMLImageElement> & {
  src: string;
};

export const Image = (props: ImageProps) => {
  return <img alt="" {...props} src={`${process.env.REACT_APP_EMAIL_ASSETS_URL ?? ''}/${props.src}`} />;
};

Image.defaultProps = {
  alt: '',
};
