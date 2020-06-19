SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	npm install -g serverless
	npm install

install-deploy: install

build:
	@echo "Test workers"

deploy:
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);
