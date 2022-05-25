SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install-node:
	npm install --legacy-peer-deps
	# After https://github.com/apptension/react-scripts-apptension/pull/60 is deployed
	# and proper version is added to package.json, --legacy-peer-deps can be removed

install-python:
	pdm sync

install-deploy: install-scripts

install: install-node install-python
	# Local machine installation rule

pull-base-image:
	/bin/sh ./scripts/pull-base-image.sh

build-base-image:
	/bin/sh ./scripts/build-base-image.sh

build-image:
	$(DOCKER_COMPOSE) build --build-arg "BASE_IMAGE=${PROJECT_NAME}-workers-base:latest" workers

test:
	$(MAKE) docker-login
	$(DOCKER_COMPOSE) up -d db
	$(MAKE) pull-base-image build-image
	$(DOCKER_COMPOSE) run --rm -T workers bash ./scripts/run_tests.sh

build: test

deploy:
	$(MAKE) docker-login pull-base-image build-image
	$(DOCKER_COMPOSE) run -e ENV_STAGE=$(ENV_STAGE) -T workers bash ./scripts/deploy.sh
	$(MAKE) upload-service-version SERVICE_NAME=workers

flake8:
	flake8

black:
	$(DOCKER_COMPOSE) run -T workers run black --config=pyproject.toml .
	
invoke-local: d ?= {}
invoke-local:
	$(DOCKER_COMPOSE) run -T workers node_modules/.bin/sls invoke local -f=$(f) -d=$(d)

shell:
	$(DOCKER_COMPOSE) run --rm workers bash


secrets: export CHAMBER_SERVICE=workers
secrets:
	$(DOCKER_COMPOSE) build ssmeditor
	$(DOCKER_COMPOSE) run --rm ssmeditor

stop-task-scheduling-executions:
	./scripts/stop-task-scheduling-executions
