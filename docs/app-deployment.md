# Deploy the app to AWS

## Switch to AWS context using aws-vault
```shell script
make aws-vault
```

## Deploy infrastructure of the environment

```shell script
make deploy-stage-infra ENV_STAGE=<ENV_STAGE_NAME>
```

This command will deploy
* Main CDK stack
* CI CDK stack
* Helper functions

## Build app components
```shell script
make build
```

## Deploy app components
Make sure that all 
```shell script
make deploy-stage-app
```
