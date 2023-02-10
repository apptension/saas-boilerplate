SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

.PHONY: deploy secrets

deploy:
	node ${SELF_DIR}scripts/run_migrations.js

secrets:
	docker-compose build ssmeditor
	docker-compose run --rm ssmeditor
