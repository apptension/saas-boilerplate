SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

.PHONY: build test

test:
	nx test

build:
	nx build

deploy:
	nx deploy

secrets:
	$(MAKE) -C $(PROJECT_ROOT_DIR) secrets-editor SERVICE_NAME=webapp
