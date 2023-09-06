SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

IS_BACKEND_CURRENT_DIR := $(shell pwd | grep 'packages/backend')
ifneq ($(IS_BACKEND_CURRENT_DIR),)
	export COMPOSE_FILE=$(SELF_DIR)/../../docker-compose.yml:$(SELF_DIR)/../../docker-compose.local.yml
endif

setup:
	chmod +x ./scripts/*.sh

build-docs:
	pnpm nx build-docs

# Local CLI rules

secrets:
	$(MAKE) -C $(PROJECT_ROOT_DIR) secrets-editor SERVICE_NAME=backend

remote-shell:
	pnpm nx remote-shell

