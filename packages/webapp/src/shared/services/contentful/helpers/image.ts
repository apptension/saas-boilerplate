import { mergeDeepRight } from 'ramda';
import { stringify } from 'query-string';
import { ContentfulAsset } from '../__generated/types';
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
  format: ImageFormat.JPG,
  quality: 90,
};

const parseOptions = (overrides: ImageOptions) => {
  const options = mergeDeepRight(defaultOptions, overrides);
  return stringify({
    fl: 'progressive',
    fm: options.format,
    q: options.quality,
    fit: options.resizingBehavior,
    w: options.size?.width,
    h: options.size?.height,
  });
};

const imageUrl = (image: ContentfulPlain<ContentfulAsset>, options: ImageOptions = {}) => {
  return image?.url + '?' + parseOptions(options);
};

export const imageProps = (image: ContentfulPlain<ContentfulAsset>, options: ImageOptions = {}) => ({
  alt: image?.title ?? image?.description ?? '',
  src: imageUrl(image, options),
});
