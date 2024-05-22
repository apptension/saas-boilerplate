import { Img } from '@react-email/components';
import { ENV } from '@sb/webapp-core/config/env';
import { ComponentPropsWithoutRef } from 'react';

export type ImageProps = ComponentPropsWithoutRef<'img'>;

const localUrl = `http://localhost:3000/email-assets`;

export const Image = (props: ImageProps) => {
  return <Img alt="" {...props} src={`${ENV.EMAIL_ASSETS_URL || localUrl}/${props.src}`} />;
};

Image.defaultProps = {
  alt: '',
};
