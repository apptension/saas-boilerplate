SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install-node:
	npm install

install-python:
	pipenv install --dev


install-test: install-python
install-build: install-node install-python
install-deploy: install-node install-python

install: install-node install-python
	# Local machine installation rule

test:
	$(DOCKER_COMPOSE) up -d db
	bash ./scripts/run_tests.sh

build: test

deploy:
	$(AWS_VAULT) $(SELF_DIR)node_modules/.bin/sls deploy --stage $(ENV_STAGE);

flake8:
	pipenv run flake8

black:
	pipenv run black --config=pyproject.toml .
