# Version matrix

## Push new environment version

In order to upload new version information use `upload.js`. It will use:

* `ENV_STAGE` for environment name
* `VERSION` as a current version being deployed
* Any key-value pairs passed at runtime in command line, separated with space

```javascript
node upload-version.js <serviceName1, ..serviceNameN> [key=value, keyN=valueN, ...]
```

It will upload `versions.json` on `${PROJECT_NAME}-status-dashboard` using your *current* AWS credentials.

## Service version upload

Each service can upload its version by using `upload-service-version.js`.

`node upload-service-version.js <name> <version> [key=value, keyN=valueN, ...]`
