SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk


install:
	npm install

deploy:
	$(SELF_DIR)node_modules/.bin/sls deploy --stage $(ENV_STAGE);
