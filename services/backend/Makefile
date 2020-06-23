SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

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

deploy: deploy-admin-panel deploy-api deploy-migrations
