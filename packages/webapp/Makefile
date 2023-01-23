SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

.PHONY: build test

test:
	nx test

build:
	nx build:app

build-emails:
	nx build:emails

deploy:
	nx deploy

secrets:
	nx run ssm-editor:serve webapp
