SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../base.mk

deploy-global-infra:
	make -C $(BASE_DIR)infra/cdk deploy-global-infra

deploy-global-tools:
	$(MAKE) -C $(BASE_DIR)infra/cdk deploy-global-tools

deploy-env-infra:
	$(MAKE) -C $(BASE_DIR)infra/cdk deploy-infra-main
	$(MAKE) -C $(BASE_DIR)infra/cdk deploy-infra-db
	$(MAKE) -C $(BASE_DIR)infra/functions deploy
	$(MAKE) -C $(BASE_DIR)infra/cdk deploy-infra-ci
