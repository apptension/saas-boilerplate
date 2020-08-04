SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	npm install

deploy-global-infra:
	npm run build;
	npm run cdk deploy *GlobalStack;
	npm run cdk deploy *UsEastResourcesStack;

deploy-global-tools:
ifneq ($(TOOLS_ENABLED),true)
	$(error "Global tools are disabled.")
else
	$(MAKE) -C $(BASE_DIR)tools/version-matrix install
	$(MAKE) -C $(BASE_DIR)tools/version-matrix build

	npm run build;
	npm run cdk deploy *GlobalToolsStack;
endif

deploy-infra-main:
	npm run build;
	npm run cdk deploy *MainStack;

deploy-infra-db:
	npm run build;
	npm run cdk deploy *DbStack;

deploy-infra-ci:
	npm run build;
	npm run cdk deploy *CiStack;

deploy-components:
	npm run build;
	npm run cdk deploy *ComponentsStack;

deploy-admin-panel:
	npm run build;
	npm run cdk deploy *AdminPanelStack;

deploy-api:
	npm run build;
	npm run cdk deploy *ApiStack;

deploy-migrations:
	npm run build;
	npm run cdk deploy *MigrationsStack;

deploy-webapp:
	npm run build;
	npm run cdk deploy *WebAppStack;

deploy-ssh-bastion:
	npm run build;
	npm run cdk deploy *SshBastionStack;
