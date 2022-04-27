SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/base.mk

install: install-infra-cdk install-infra-functions install-scripts
	$(foreach file, $(wildcard $(SERVICES_DIR)/*), make -C $(file) install;)

setup-tools:
	cd $(SELF_DIR)scripts/setup && ../node_modules/.bin/plop configTools

setup-infra:
	chmod +x ./scripts/*.sh
	cd $(SELF_DIR)scripts && $(SHELL) cdk-bootstrap.sh

rm-docker-volume:
	docker volume rm $(PROJECT_NAME)-web-backend-db-data

create-docker-volume:
	docker volume create --name=$(PROJECT_NAME)-web-backend-db-data

setup: create-docker-volume
	$(foreach file, $(wildcard $(SERVICES_DIR)/*), cp $(file)/.env.example $(file)/.env 2>/dev/null || :;)

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
	node $(BASE_DIR)/scripts/upload-version.js migrations,api,workers,webapp

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

stop-task-scheduling-executions:
	$(MAKE) -C $(SELF_DIR)services/workers stop-task-scheduling-executions

#
# Helper rules
#

psql:
	$(DOCKER_COMPOSE) exec db psql -d'backend' -U'backend'
