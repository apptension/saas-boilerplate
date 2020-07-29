# Create new environment stage

## Variables:
- `<ENV_STAGE_NAME>` – change this to the name of your environment (e.g. `dev`, `staging`, `qa`)

## Create a new env configuration file
```sh
make create-env
```

This command will create following file named `.awsboilerplate.<ENV_STAGE_NAME>.json`:
```json
{
  "hostedZone": {
    "id": "<HOSTED_ZONE_ID>",
    "name": "<HOSTED_ZONE_NAME>"
  },
  "basicAuth": "admin:<BASIC_AUTH_PASS>",
  "domains": {
    "adminPanel": "admin.<DOMAIN_NAME>",
    "api": "api.<DOMAIN_NAME>",
    "webApp": "app.<DOMAIN_NAME>",
  }
}
```

## Deploy infrastructure of the new environment

### Set environment parameters
Backend image needs couple of parameters set in AWS SSM parameter store.
Those parameters should be set to a `SecureString` and encrypted with a KMS key 
with alias `{PROJECT_NAME}-{ENV_STAGE_NAME}-main` key. This key is created by the Main CDK stack.

#### Backend

- `/env-{PROJECT_NAME}-{ENV_STAGE_NAME}-backend/DJANGO_DEBUG`
- `/env-{PROJECT_NAME}-{ENV_STAGE_NAME}-backend/DJANGO_SECRET_KEY`
- `/env-{PROJECT_NAME}-{ENV_STAGE_NAME}-backend/HASHID_FIELD_SALT`

### Switch to AWS context using aws-vault
```shell
make aws-vault
```

```shell
make deploy-stage-infra ENV_STAGE=<ENV_STAGE_NAME>
```

This command will deploy
* Main CDK stack
* CI CDK stack
* Helper functions
