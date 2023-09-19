import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const ENV_STAGE = process.env.ENV_STAGE;
const SB_TOOLS_ENABLED = process.env.SB_TOOLS_ENABLED;
const PROJECT_NAME = process.env.PROJECT_NAME;
const CURRENT_VERSION = process.env.VERSION;
const VERSIONS_BUCKET = `${PROJECT_NAME}-status-dashboard`;

if (SB_TOOLS_ENABLED !== 'true') {
  console.log('Global tools are disabled. Skipping upload-service-version');
  process.exit(0);
}

if (!ENV_STAGE || ENV_STAGE === 'local') {
  console.log('Skipping upload-service-version for local env');
  process.exit(0);
}

const [serviceName, ...valuesArgv] = process.argv.slice(2);

const values = valuesArgv.reduce((values, arg) => {
  const [label, value] = arg.split('=');

  return [...values, { label, value }];
}, []);

const s3Client = new S3Client();

function putJsonObject(bucket, key, payload) {
  return s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      CacheControl: 'no-cache',
      ACL: 'public-read',
      ContentType: 'application/json',
      Body: JSON.stringify(payload),
    })
  );
}

(async () => {
  await putJsonObject(VERSIONS_BUCKET, `${ENV_STAGE}-${serviceName}.json`, {
    name: serviceName,
    version: CURRENT_VERSION,
    builtAt: new Date(),
    values,
  });
})();
