SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	@echo "install"

install-deploy: install-infra-cdk install-scripts

test:
	@echo "test"

build: test
	mkdir -p build
	cp index.html build/index.html

deploy: SERVICE_URL=$(call GetFromEnvCfg,domains.webApp)
deploy:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-webapp
	$(MAKE) upload-service-version SERVICE_NAME=webapp SERVICE_PARAMS="url=https://$(SERVICE_URL)"
