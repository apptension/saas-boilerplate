SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	@echo "install"

install-deploy: install-infra-cdk

build:
	mkdir -p build
	cp index.html build/index.html

deploy:
	cd $(SELF_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *WebAppStack;
