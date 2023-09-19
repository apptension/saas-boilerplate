import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';

const ENV_STAGE = process.env.ENV_STAGE;
const CURRENT_VERSION = process.env.VERSION;
const PROJECT_NAME = process.env.PROJECT_NAME;
const VERSIONS_BUCKET = `${PROJECT_NAME}-status-dashboard`;
const VERSIONS_OBJECT = 'versions.json';

const [servicesArgv, ...valuesArgv] = process.argv.slice(2);

const values = valuesArgv.reduce((values, arg) => {
  const [label, value] = arg.split('=');

  return [...values, { label, value }];
}, []);

const services = servicesArgv.split(',');

const s3Client = new S3Client();

const newVersion = {
  name: ENV_STAGE,
  version: CURRENT_VERSION,
  builtAt: new Date(),
  services,
  values,
};

type NewVersion = typeof newVersion;

function putJsonObject(payload) {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: VERSIONS_BUCKET,
      Key: VERSIONS_OBJECT,
      CacheControl: 'no-cache',
      ACL: 'public-read',
      ContentType: 'application/json',
      Body: JSON.stringify(payload),
    })
  );
}

(async () => {
  try {
    const data = await s3Client.send(
      new GetObjectCommand({ Bucket: VERSIONS_BUCKET, Key: VERSIONS_OBJECT })
    );

    const versions = JSON.parse(data.Body?.toString() ?? '{}');
    const newVersions: NewVersion[] = [];

    let found = false;
    for (const version of versions) {
      if (version.name === ENV_STAGE) {
        newVersions.push(newVersion);
        found = true;
      } else {
        newVersions.push(version);
      }
    }

    if (!found) {
      newVersions.push(newVersion);
    }

    await putJsonObject(newVersions);
  } catch (error) {
    await putJsonObject([newVersion]);
  }
})();
