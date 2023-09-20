import { Asset } from '@sb/webapp-api-client';

import { ContentfulPlain } from '../../types';
import { ImageFormat, ResizingBehavior, imageProps } from '../image';

const image: ContentfulPlain<Asset> = {
  title: 'Image title',
  url: 'http://image.org',
};

describe('contentful / helpers / image', () => {
  describe('imageUrl', () => {
    describe('with default options', () => {
      it('should return alt title', () => {
        expect(imageProps(image).alt).toEqual('Image title');
      });

      it('should return png url with default options', () => {
        expect(imageProps(image).src).toEqual('http://image.org?fm=png&q=90');
      });
    });

    describe('with custom options', () => {
      it('should return jpg url with fl=progressive options when set format to jpg', () => {
        expect(imageProps(image, { format: ImageFormat.JPG }).src).toEqual(
          'http://image.org?fl=progressive&fm=jpg&q=90'
        );
      });

      it('should return src using custom options', () => {
        const options = {
          format: ImageFormat.WEBP,
          size: {
            height: 100,
          },
          quality: 50,
          resizingBehavior: ResizingBehavior.FILL,
        };
        expect(imageProps(image, options).src).toEqual('http://image.org?fit=fill&fm=webp&h=100&q=50');
      });
    });

    describe('with missing image url', () => {
      it('should return null', () => {
        const missingImage = {
          title: 'Image title',
        };

        expect(imageProps(missingImage).src).toEqual(null);
      });
    });

    describe('with empty options', () => {
      it('should return png url with default options', () => {
        const emptyOptions = {};
        expect(imageProps(image, emptyOptions).src).toEqual('http://image.org?fm=png&q=90');
      });
    });
  });
});
