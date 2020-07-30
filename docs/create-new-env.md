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

### Set environmental variables
Before you deploy make sure you set up following environmental variables. Otherwise your services will fail to start.
Check [environmental variables docs](/docs/misc/environmental-variables.md) on how to do it from your local machine.

#### Backend

| Name              | Example                          | Description                                                                   |
|-------------------|----------------------------------|-------------------------------------------------------------------------------|
| DJANGO_DEBUG      | True                             | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#std:setting-DEBUG) |
| DJANGO_SECRET_KEY | Zs639zRcb5!9om2@tW2H6XG#Znj^TB^I | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#secret-key)        |
| HASHID_FIELD_SALT | t5$^r*xsMRXn1xjzhRSl8I5Hb3BUW$4U | [docs](https://github.com/nshafer/django-hashid-field#hashid_field_salt)      |


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
