SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/base.mk

.PHONY: shell help build rebuild service login test clean prune version

install: install-infra-cdk install-infra-functions install-scripts
	$(foreach file, $(wildcard $(SERVICES_DIR)/*), make -C $(file) install;)

setup-infra:
	chmod +x ./scripts/*.sh
	scripts/cdk-bootstrap.sh

setup-docker:
	docker volume create --name=$(PROJECT_NAME)-web-backend-db-data

setup: install setup-docker

create-env:
	cd scripts/setup && plop createEnv

#
# Infrastructure deployment
#

deploy-global-infra:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-global-infra

deploy-global-tools:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-global-tools

deploy-stage-infra:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-stage-infra

upload-version:
	node $(BASE_DIR)/scripts/upload-version.js migrations,api,workers,webapp,admin-panel

#
# Services deployment
#

build:
	@echo Build version: $(VERSION)
	$(foreach file, $(wildcard $(SERVICES_DIR)/*), make -C $(file) build;)

deploy-components:
	$(MAKE) -C $(SELF_DIR)infra/cdk deploy-components

deploy-stage-app: deploy-components
	$(foreach file, $(wildcard $(SERVICES_DIR)/*), make -C $(file) deploy;)

