# Create new Serverless service

## Configure `serverless.yml` file
Your service's name should start with `PROJECT_NAME` environment variable.

```yml
service: "${env:PROJECT_NAME}-<CHANGE_ME>"

provider:
  name: aws
  runtime: python3.8
  versionFunctions: false
  region: "${env:AWS_DEFAULT_REGION}"

functions:
  hello:
    handler: handler.hello
    timeout: 6
    memorySize: 256

```

## Configure `Makefile`
Make sure you include the `base.mk` file so that all environment variables are correctly set up and base rules are defined. There're four required rules that you have to define:
* `install` – Install any dependencies required for build step
* `install-deploy` – Install any dependencies required for deploy step
* `build` – Build the Serverless package
* `deploy` – Deploy the Serverless package

```shell
SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	npm install -g serverless
	npm install

install-deploy: install

build:
	@echo "Test <CHANGE_ME>"

deploy:
	sls deploy --stage $(ENV_STAGE);
	$(MAKE) upload-service-version SERVICE_NAME=<CHANGE_ME>;
```

## Configure CI/CD steps

Open `infra/cdk/lib/stacks/env/ci/ciPipeline.ts` file and edit `configureEnv` function:
```ts
private configureEnv(pipeline: Pipeline, props: CiPipelineProps) {
    // ...

    new ServerlessCiConfig(this, "<CHANGE_ME>Config", {
        name: '<CHANGE_ME>',
        envSettings: props.envSettings,
        buildStage,
        deployStage,
        inputArtifact: sourceOutputArtifact,
    });
}
```

Update CI pipeline
```shell
make deploy-infra-ci
```

## Configure `Makefile` in the project's root directory
Add build step to `build` rule.
```
build:
	# ...
	$(MAKE) -C services/<CHANGE_ME> build
```

Add deployment step to `deploy-env-app` rule.
```
deploy-env-app:
	# ...
	$(MAKE) -C services/<CHANGE_ME> deploy
```

Deploy the app
```shell
make deploy-env-app
```
