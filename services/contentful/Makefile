SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

.PHONY: build test

install:
	npm install

install-deploy: install-infra-cdk install-scripts

test:
	@echo "Test contentful"

build: CHAMBER_SERVICE_NAME=env-${PROJECT_ENV_NAME}-contentful
build: 
	 @echo "Build contentful"

deploy:
	node ${SELF_DIR}scripts/run_migrations.js

secrets: export CHAMBER_SERVICE=contentful
secrets:
	$(DOCKER_COMPOSE) build ssmeditor
	$(DOCKER_COMPOSE) run --rm ssmeditor
