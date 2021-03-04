import React, { HTMLAttributes } from 'react';

export interface ImageProps extends HTMLAttributes<HTMLImageElement> {
  src: string;
}

export const Image = (props: ImageProps) => {
  return <img alt="" {...props} src={`${process.env.PUBLIC_BUCKET_URL ?? ''}/email-assets/${props.src}`} />;
};

Image.defaultProps = {
  alt: '',
};
