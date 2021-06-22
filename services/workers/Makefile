SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install-node:
	npm install

install-python:
	pdm install

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
	$(DOCKER_COMPOSE) up -d db
	$(MAKE) docker-login pull-base-image build-image
	$(DOCKER_COMPOSE) run -T workers bash ./scripts/run_tests.sh

build: test

deploy:
	$(MAKE) docker-login pull-base-image build-image
	$(DOCKER_COMPOSE) run -T workers node_modules/.bin/sls deploy --stage $(ENV_STAGE);
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
