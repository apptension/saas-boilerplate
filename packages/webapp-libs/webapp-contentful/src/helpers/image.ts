import { Asset } from '@sb/webapp-api-client';
import { stringify } from 'query-string';
import { mergeDeepRight } from 'ramda';

import { ContentfulPlain } from '../types';

export enum ImageFormat {
  JPG = 'jpg',
  PNG = 'png',
  WEBP = 'webp',
}

export enum ResizingBehavior {
  PAD = 'pad',
  FILL = 'fill',
  SCALE = 'scale',
  CROP = 'crop',
  THUMB = 'thumb',
}

interface ImageOptions {
  format?: ImageFormat;
  size?: {
    width?: number;
    height?: number;
  };
  quality?: number;
  resizingBehavior?: ResizingBehavior;
}

const defaultOptions: ImageOptions = {
  format: ImageFormat.PNG,
  quality: 90,
};

const parseOptions = (overrides: ImageOptions) => {
  const options = mergeDeepRight(defaultOptions, overrides);
  const formatAdditionalOptions = options.format === ImageFormat.JPG ? { fl: 'progressive' } : {};
  return stringify({
    ...formatAdditionalOptions,
    fm: options.format,
    q: options.quality,
    fit: options.resizingBehavior,
    w: options.size?.width,
    h: options.size?.height,
  });
};

const imageUrl = (image: ContentfulPlain<Asset> | null | undefined, options: ImageOptions = {}) => {
  if (!image?.url) {
    return null;
  }
  return (image?.url ?? '') + '?' + parseOptions(options);
};

export const imageProps = (image: ContentfulPlain<Asset> | null | undefined, options: ImageOptions = {}) => ({
  alt: image?.title ?? image?.description ?? '',
  src: imageUrl(image, options),
});
