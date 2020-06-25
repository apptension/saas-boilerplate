SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	npm install -g serverless
	npm install
	pipenv install --dev

install-deploy: install

test:
	pytest

build:
	$(DOCKER_COMPOSE) up -d db
	$(MAKE) test

deploy:
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);
