SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

.PHONY: build test

install:
	yarn install

install-deploy: install-infra-cdk install-scripts

pull-base-image:
	/bin/sh ./scripts/pull-base-image.sh


test:
ifeq ($(CI),true)
	$(DOCKER_COMPOSE) run webapp sh ./scripts/run_tests.sh
else
	sh ./scripts/run_tests.sh
endif


build-image:
	$(DOCKER_COMPOSE) build --build-arg "BASE_IMAGE=${PROJECT_NAME}-webapp-base:latest" webapp

build: CHAMBER_SERVICE_NAME=env-${PROJECT_ENV_NAME}-webapp
build: pull-base-image build-image test
	$(DOCKER_COMPOSE) run webapp sh -c "/bin/chamber exec ${CHAMBER_SERVICE_NAME} -- yarn build"

build-emails: CHAMBER_SERVICE_NAME=env-${PROJECT_ENV_NAME}-webapp
build-emails: pull-base-image build-image
	$(DOCKER_COMPOSE) run webapp sh -c "/bin/chamber exec ${CHAMBER_SERVICE_NAME} -- yarn build-emails"

build-test: pull-base-image build-image test
	$(DOCKER_COMPOSE) run webapp yarn build

build-base-image:
	sh ./scripts/build-base-image.sh

deploy: SERVICE_URL=$(call GetFromEnvCfg,domains.webApp)
deploy:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-webapp
	$(MAKE) upload-service-version SERVICE_NAME=webapp SERVICE_PARAMS="url=https://$(SERVICE_URL)"

secrets: export CHAMBER_SERVICE=webapp
secrets:
	$(DOCKER_COMPOSE) build ssmeditor
	$(DOCKER_COMPOSE) run --rm ssmeditor
