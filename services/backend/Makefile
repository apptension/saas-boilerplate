SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	pipenv install --dev

install-deploy: install-infra-cdk install-infra-functions install-scripts

setup:
	chmod +x ./scripts/*.sh

test:
	$(DOCKER_COMPOSE) run -T backend ./scripts/run_tests.sh

build:
	$(MAKE) test
	/bin/sh ./scripts/build.sh

deploy-admin-panel: SERVICE_URL=$(call GetFromEnvCfg,domains.adminPanel)
deploy-admin-panel:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-admin-panel
	$(MAKE) upload-service-version SERVICE_NAME=admin-panel SERVICE_PARAMS="url=https://$(SERVICE_URL)"

deploy-api: SERVICE_URL=$(call GetFromEnvCfg,domains.api)
deploy-api:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-api
	$(MAKE) upload-service-version SERVICE_NAME=api SERVICE_PARAMS="url=https://$(SERVICE_URL)"

deploy-migrations:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-migrations

	cd $(BASE_DIR)/infra/functions;\
	node_modules/.bin/sls invoke --stage $(ENV_STAGE) -f TriggerMigrationsJob
	$(MAKE) upload-service-version SERVICE_NAME=migrations

deploy: deploy-migrations deploy-admin-panel deploy-api

ssh-bastion: public_key ?= ~/.ssh/id_rsa.pub
ssh-bastion: private_key ?= ~/.ssh/id_rsa
ssh-bastion: export BASTION_SSH_PUBLIC_KEY=$(shell cat $(public_key))
ssh-bastion: export BASTION_SSH_PRIVATE_KEY=$(private_key)
ssh-bastion:
	$(MAKE) -C $(BASE_DIR)infra/cdk deploy-ssh-bastion
	node $(BASE_DIR)scripts/run-ssh-bastion-task.js

# Local CLI rules

shell:
	$(DOCKER_COMPOSE) run --rm backend bash

create-app:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "cd apps && django-admin startapp $(app_name)"

makemigrations:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "python ./manage.py makemigrations"

migrate:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "python ./manage.py migrate"

flake8:
	$(DOCKER_COMPOSE) run --rm -T backend flake8

black:
	$(DOCKER_COMPOSE) run --rm -T backend black --config=pyproject.toml .

secrets: export CHAMBER_SERVICE=backend
secrets:
	$(DOCKER_COMPOSE) build ssmeditor
	$(DOCKER_COMPOSE) run --rm ssmeditor
