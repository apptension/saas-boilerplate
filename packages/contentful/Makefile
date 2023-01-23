SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

.PHONY: deploy secrets

deploy:
	node ${SELF_DIR}scripts/run_migrations.js

secrets:
	$(DOCKER_COMPOSE) build ssmeditor
	$(DOCKER_COMPOSE) run --rm ssmeditor
