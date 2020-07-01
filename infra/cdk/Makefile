SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	npm install

deploy-global-infra:
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *GlobalStack;

deploy-global-tools:
	$(MAKE) -C $(BASE_DIR)/tools/version-matrix install
	$(MAKE) -C $(BASE_DIR)/tools/version-matrix build

	npm run build;
	$(AWS_VAULT) npm run cdk deploy *GlobalToolsStack;

deploy-infra-main:
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *MainStack;

deploy-infra-ci:
	pwd;
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *CiStack;

deploy-components:
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *ComponentsStack;

deploy-admin-panel:
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *AdminPanelStack;

deploy-api:
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *ApiStack;

deploy-migrations:
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *MigrationsStack;

deploy-webapp:
	npm run build;
	$(AWS_VAULT) npm run cdk deploy *WebAppStack;
