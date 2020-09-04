SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install-node:
	npm install

install-python:
	pipenv install --dev

install-build: install-node install-python
install-deploy: install-node install-python install-scripts

install: install-node install-python
	# Local machine installation rule

test:
	$(DOCKER_COMPOSE) up -d db
	$(DOCKER_COMPOSE) build workers
	$(DOCKER_COMPOSE) run -T workers ./scripts/run_tests.sh

build: test

deploy:
	$(SELF_DIR)node_modules/.bin/sls deploy --stage $(ENV_STAGE);
	$(MAKE) upload-service-version SERVICE_NAME=workers

flake8:
	pipenv run flake8

black:
	pipenv run black --config=pyproject.toml .

invoke-hello:
	sls invoke --stage $(ENV_STAGE) -f hello;

