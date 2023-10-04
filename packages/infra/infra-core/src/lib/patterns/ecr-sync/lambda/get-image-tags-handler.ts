import { Stream, PassThrough } from 'stream';
import * as aws from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { getDockerImageTags } from './docker-adapter';
import { getEcrImageTags } from './ecr-adapter';
import { Image } from '../image';

export interface ContainerImage {
  tag: string;
  lastUpdated: string;
  digest?: string;
}

export async function handler(): Promise<void> {
  const accountId = process.env['AWS_ACCOUNT_ID']!;
  const region = process.env['REGION']!;

  const images: Image[] = JSON.parse(process.env['IMAGES'] ?? '[]');
  const repoPrefix: string = process.env['REPO_PREFIX'] ?? '';

  let buildTriggerFile: string = '';

  await Promise.all(
    images.map(async (image: Image) => {
      // List all image tags in ECR
      let ecrImageName = image.imageName;

      if (repoPrefix.length > 0) {
        ecrImageName = `${repoPrefix}/${ecrImageName}`;
      }

      const ecrImageTags = await getEcrImageTags(ecrImageName);
      console.debug(
        `ECR images for ${image.imageName}: \n${ecrImageTags
          .map((t) => `${t.tag} (${t.digest})`)
          .join('\n')}`,
      );

      // List all image tags in Docker
      const dockerImageTags = await getDockerImageTags(image.imageName);
      console.debug(
        `Docker images for ${image.imageName}: ${dockerImageTags
          .map((t) => `${t.tag} (${t.digest})`)
          .join('\n')}`,
      );

      let missingImageTags = await filterTags(
        dockerImageTags,
        ecrImageTags,
        image,
      );
      let orderedImageTags = await orderTags(missingImageTags);
      buildTriggerFile += await formatTriggerLines(
        image,
        orderedImageTags,
        repoPrefix,
        accountId,
        region,
      );
    }),
  );

  console.info(`Images to sync:\n${buildTriggerFile}`);

  if (buildTriggerFile === '') return;

  const stream = await zipToFileStream(buildTriggerFile);
  await uploadToS3(
    process.env['BUCKET_NAME']!,
    process.env['IMAGES_ARCHIVE_FILENAME']!,
    stream,
  );
}

export async function orderTags(imageTags: ContainerImage[]) {
  return imageTags.sort((a, b) => a.lastUpdated.localeCompare(b.lastUpdated));
}

export async function formatTriggerLines(
  image: Image,
  missingImageTags: ContainerImage[],
  repoPrefix: string,
  accountId: string,
  region: string,
) {
  let buildTriggerFile: string = '';

  missingImageTags.forEach((t) => {
    const ecrImageName = repoPrefix
      ? `${repoPrefix}/${image.imageName}`
      : image.imageName;
    buildTriggerFile += `${image.imageName},${accountId}.dkr.ecr.${region}.amazonaws.com/${ecrImageName},${t.tag}\n`;
  });

  return buildTriggerFile;
}

export async function filterTags(
  dockerImageTags: ContainerImage[],
  ecrImageTags: ContainerImage[],
  image: Image,
) {
  let missingImageTags: ContainerImage[] = dockerImageTags.filter(
    (dockerImage) => {
      return (
        ecrImageTags.filter(
          (ecrImage) =>
            ecrImage.tag === dockerImage.tag &&
            ecrImage.digest === dockerImage.digest,
        ).length === 0
      );
    },
  );

  return missingImageTags.filter((t) => {
    // If nothing is defined allow all
    if (image.includeTags === undefined && image.excludeTags === undefined) {
      return true;
    }

    // Deny if tag matches `excludeTags`
    if (image.excludeTags !== undefined) {
      if (image.excludeTags.some((excludeTag) => t.tag.match(excludeTag))) {
        return false;
      }
    }

    // Allow if tag matches `includeTags`
    if (image.includeTags !== undefined) {
      if (image.includeTags.some((includeTag) => t.tag.match(includeTag))) {
        return true;
      }
    }

    // If only excludeTags is defined all others should be included
    if (image.includeTags === undefined && image.excludeTags !== undefined) {
      return true;
    }

    return false;
  });
}

async function uploadToS3(bucket: string, key: string, stream: PassThrough) {
  const params: PutObjectRequest = {
    Body: stream,
    Bucket: bucket,
    ContentType: 'application/zip',
    Key: key,
    StorageClass: 'STANDARD_IA',
  };

  return new aws.S3()
    .upload(params, (error: Error): void => {
      if (error) {
        console.error(
          `Got error creating stream to s3 ${error.name} ${error.message} ${error.stack}`,
        );
        throw error;
      }
    })
    .promise();
}

async function zipToFileStream(content: string): Promise<PassThrough> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports,import/no-extraneous-dependencies
  var JSZip = require('jszip');
  var zip = new JSZip();

  zip.file(process.env['IMAGES_CSV_FILENAME'], content);

  const streamPassThrough = new Stream.PassThrough();
  await zip
    .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
    .pipe(streamPassThrough);

  return streamPassThrough;
}
