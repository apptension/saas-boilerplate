SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../Makefile.base.mk

.PHONY: test secrets

test: CHAMBER_SERVICE_NAME=env-${PROJECT_ENV_NAME}-e2e
test:
	nx test

secrets:
	nx run ssm-editor:serve e2e
