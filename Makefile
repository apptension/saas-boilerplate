SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/base.mk

install: install-infra-cdk install-infra-functions install-scripts
	$(foreach file, $(wildcard $(SERVICES_DIR)/*), make -C $(file) install;)

setup-tools:
	cd $(SELF_DIR)scripts/setup && plop configTools

setup-infra:
	chmod +x ./scripts/*.sh
	cd $(SELF_DIR)scripts && $(SHELL) cdk-bootstrap.sh

setup-docker:
	docker volume create --name=$(PROJECT_NAME)-web-backend-db-data

create-env:
	cd scripts/setup && ../node_modules/.bin/plop createEnv

create-repo-auth-url:
	node $(SELF_DIR)scripts/create-cicd-creds.js

#
# Infrastructure deployment
#

deploy-global-infra:
	$(MAKE) -C $(SELF_DIR)infra deploy-global-infra

deploy-global-tools:
	$(MAKE) -C $(SELF_DIR)infra deploy-global-tools

deploy-env-infra:
	$(MAKE) -C $(SELF_DIR)infra deploy-env-infra

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

deploy-env-app: deploy-components
	$(foreach file, $(wildcard $(SERVICES_DIR)/*), make -C $(file) deploy;)

