import { Img } from '@react-email/components';
import { ENV } from '@sb/webapp-core/config/env';
import { ComponentPropsWithoutRef } from 'react';

export type ImageProps = ComponentPropsWithoutRef<'img'>;

const baseURL = ENV.EMAIL_ASSETS_URL || `/static`;

export const Image = (props: ImageProps) => {
  return <Img alt="" {...props} src={`${baseURL}/${props.src}`} />;
};

Image.defaultProps = {
  alt: '',
};
