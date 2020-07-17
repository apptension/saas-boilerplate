#!/usr/bin/env node

const AWS = require('aws-sdk');

const ENV_STAGE = process.env.ENV_STAGE;
const CURRENT_VERSION = process.env.VERSION;
const PROJECT_NAME = process.env.PROJECT_NAME;
const VERSIONS_BUCKET = `${PROJECT_NAME}-version-matrix`;
const VERSIONS_OBJECT = 'versions.json';

const [servicesArgv, ...valuesArgv] = process.argv.slice(2);

const values = valuesArgv.reduce((values, arg) => {
    const [label, value] = arg.split('=');

    return [...values, { label, value }];
}, []);

const services = servicesArgv.split(',');

const s3 = new AWS.S3();

const newVersion = {
    name: ENV_STAGE,
    version: CURRENT_VERSION,
    builtAt: new Date(),
    services,
    values,
};

function putJsonObject(payload) {
    s3.putObject({
        Bucket: VERSIONS_BUCKET,
        Key: VERSIONS_OBJECT,
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

s3.getObject(
    { Bucket: VERSIONS_BUCKET, Key: VERSIONS_OBJECT },
    function (error, data) {
        if (error != null && error.statusCode === 404) {
            putJsonObject([newVersion]);
        } else {
            const versions = JSON.parse(data.Body.toString('utf-8'));
            const newVersions = [];

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

            putJsonObject(newVersions);
        }
    }
);
