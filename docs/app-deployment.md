# Deploy the app to AWS

## Switch to AWS context using aws-vault
```shell
make aws-vault
```

## Deploy infrastructure of the environment

```shell
make deploy-stage-infra ENV_STAGE=<ENV_STAGE_NAME>
```

This command will deploy
* Main CDK stack
* CI CDK stack
* Helper functions

## Build app components
```shell
make build
```

## Deploy app components
```shell
make deploy-stage-app
```
