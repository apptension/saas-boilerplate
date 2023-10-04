// eslint-disable-next-line import/no-extraneous-dependencies
import * as aws from 'aws-sdk';
import { ContainerImage } from './get-image-tags-handler';

export async function getEcrImageTags(
  image: string,
): Promise<ContainerImage[]> {
  let images: ContainerImage[] = [];

  return new Promise((resolve, _) => {
    const ecr = new aws.ECR();

    ecr.listImages({ repositoryName: image }).eachPage((__, data) => {
      if (data === null) {
        resolve(images);
        return false;
      }

      const mapped: ContainerImage[] = data.imageIds!.map((x) => {
        return { tag: x.imageTag!, lastUpdated: '', digest: x.imageDigest! };
      });
      images = [...images, ...mapped];

      return true;
    });
  });
}
