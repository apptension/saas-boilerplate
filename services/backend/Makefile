SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

COMPOSE_SHELL = docker-compose -p $(PROJECT_NAME)_$(HOST_UID) run --rm backend

shell:
ifeq ($(CMD_ARGUMENTS),)
	# no command is given, default to shell
	$(COMPOSE_SHELL) sh
else
	# run the command
	$(COMPOSE_SHELL) sh -c "$(CMD_ARGUMENTS)"
endif

install:
	pipenv install --dev

install-deploy: install-infra-cdk install-infra-functions

setup:
	chmod +x ./scripts/*.sh

build:
	$(AWS_VAULT) /bin/sh ./scripts/build.sh

deploy-admin-panel:
	cd $(SELF_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *AdminPanelStack;

deploy-api:
	cd $(SELF_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *ApiStack;

deploy-migrations:
	cd $(SELF_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *MigrationsStack;

	cd $(SELF_DIR)/infra/functions;\
	$(AWS_VAULT) sls invoke --stage $(ENV_STAGE) -f TriggerMigrationsJob

deploy: deploy-migrations deploy-admin-panel deploy-api

makemigrations:
	$(COMPOSE_SHELL) sh -c "python ./manage.py makemigrations"

migrate:
	$(COMPOSE_SHELL) sh -c "python ./manage.py migrate"