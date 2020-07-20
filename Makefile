SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/base.mk

.PHONY: shell help build rebuild service login test clean prune version

install: install-infra-cdk install-infra-functions
	$(MAKE) -C $(SELF_DIR)/services/backend install
	$(MAKE) -C $(SELF_DIR)/services/workers install
	$(MAKE) -C $(SELF_DIR)/services/webapp install

setup-infra:
	chmod +x ./scripts/*.sh
	scripts/cdk-bootstrap.sh

setup-docker:
	docker volume create --name=$(PROJECT_NAME)-web-backend-db-data

setup: install setup-docker

create-env:
	cd scripts/setup && plop createEnv

test:
	# here it is useful to add your own customised tests
	docker-compose -p $(PROJECT_NAME)_$(HOST_UID) run --rm backend sh -c '\
		echo "I am `whoami`. My uid is `id -u`." && echo "Docker runs!"' \
	&& echo success

#
# Infrastructure deployment
#

deploy-global-infra:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-global-infra

deploy-global-tools:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-global-tools

deploy-infra-main:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-infra-main

deploy-infra-ci:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-infra-ci

deploy-infra-functions:
	$(MAKE) -C $(SELF_DIR)infra/functions deploy

deploy-stage-infra: deploy-infra-main deploy-infra-functions deploy-infra-ci

upload-version:
	node $(BASE_DIR)/scripts/upload-version.js api,workers,webapp,admin-panel


#
# Services deployment
#

build:
	@echo Build version: $(VERSION)
	$(MAKE) -C services/backend build
	$(MAKE) -C services/webapp build
	$(MAKE) -C services/workers build

deploy-components:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-components

deploy-stage-app: deploy-components
	$(MAKE) -C services/backend deploy-migrations
	$(MAKE) -C services/backend deploy-admin-panel
	$(MAKE) -C services/backend deploy-api
	$(MAKE) -C services/workers deploy
	$(MAKE) -C services/webapp deploy
