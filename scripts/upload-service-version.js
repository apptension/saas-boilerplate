#!/usr/bin/env node

const AWS = require('aws-sdk');

const ENV_STAGE = process.env.ENV_STAGE;
const PROJECT_NAME = process.env.PROJECT_NAME;
const VERSIONS_BUCKET = `${PROJECT_NAME}-version-matrix`;

const [serviceName, serviceVersion, ...valuesArgv] = process.argv.slice(2);

const values = valuesArgv.reduce((values, arg) => {
    const [label, value] = arg.split('=');

    return [...values, { label, value }];
}, []);

const s3 = new AWS.S3();

function putJsonObject(bucket, key, payload) {
    s3.putObject({
        Bucket: bucket,
        Key: key,
        CacheControl: 'no-cache',
        ACL: 'public-read',
        ContentType: 'application/json',
        Body: JSON.stringify(payload),
    }, (error, output) => {
        if (error) {
            console.log(error);
        }
    });
}

putJsonObject(VERSIONS_BUCKET, `${ENV_STAGE}-${serviceName}.json`, {
    name: serviceName,
    version: serviceVersion,
    builtAt: new Date(),
    values,
});
