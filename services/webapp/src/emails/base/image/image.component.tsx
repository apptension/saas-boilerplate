import { HTMLAttributes } from 'react';
import { ENV } from '../../../app/config/env';

export type ImageProps = HTMLAttributes<HTMLImageElement> & {
  src: string;
};

export const Image = (props: ImageProps) => {
  return <img alt="" {...props} src={`${ENV.EMAIL_ASSETS_URL}/${props.src}`} />;
};

Image.defaultProps = {
  alt: '',
};
