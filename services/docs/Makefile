SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

.PHONY: build test

install:
	yarn install

install-deploy: install-infra-cdk install-scripts

build:
	yarn build

deploy: SERVICE_URL=$(call GetFromEnvCfg,domains.webApp)
deploy:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-docs
