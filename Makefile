SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/base.mk

.PHONY: shell help build rebuild service login test clean prune version

install: install-infra-cdk install-infra-functions
	$(MAKE) -C $(SELF_DIR)/services/backend install
	$(MAKE) -C $(SELF_DIR)/services/workers install
	$(MAKE) -C $(SELF_DIR)/services/webapp install

setup-infra:
	chmod +x ./scripts/*.sh
	$(AWS_VAULT) scripts/cdk-bootstrap.sh

setup-docker:
	docker volume create --name=$(PROJECT_NAME)-web-backend-db-data

setup: install setup-infra setup-docker

test:
	# here it is useful to add your own customised tests
	docker-compose -p $(PROJECT_NAME)_$(HOST_UID) run --rm backend sh -c '\
		echo "I am `whoami`. My uid is `id -u`." && echo "Docker runs!"' \
	&& echo success

#
# Infrastructure deployment
#

deploy-global-infra:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *GlobalStack;

deploy-global-tools:
	$(MAKE) -C tools/version-matrix install
	$(MAKE) -C tools/version-matrix build

	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *GlobalToolsStack;

deploy-infra-main:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *MainStack;

deploy-infra-ci:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *CiStack;

deploy-infra-functions:
	cd $(SELF_DIR)infra/functions;\
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);

deploy-stage-infra: deploy-infra-main deploy-infra-functions deploy-infra-ci

upload-version:
	$(AWS_VAULT) node $(BASE_DIR)/scripts/upload-version.js

#
# Services deployment
#

build:
	@echo Build version: $(VERSION)
	$(AWS_VAULT) $(MAKE) -C services/backend build
	$(MAKE) -C services/webapp build
	$(MAKE) -C services/workers build

deploy-components:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *ComponentsStack;

deploy-stage-app: deploy-components
	$(MAKE) -C services/backend deploy-migrations
	$(MAKE) -C services/backend deploy-admin-panel
	$(MAKE) -C services/backend deploy-api
	$(MAKE) -C services/workers deploy
	$(MAKE) -C services/webapp deploy
