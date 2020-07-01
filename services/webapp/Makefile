SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	@echo "install"

install-deploy: install-infra-cdk

test:
	@echo "test"

build: test
	mkdir -p build
	cp index.html build/index.html

deploy:
	cd $(BASE_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *WebAppStack;
