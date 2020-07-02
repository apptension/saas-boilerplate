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
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-webapp
