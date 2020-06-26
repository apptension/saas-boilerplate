SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	npm install -g serverless
	npm install
	pipenv install --dev

install-deploy: install

test:
	pipenv run pytest

build:
	$(DOCKER_COMPOSE) run -d db
	sh $(BASE_DIR)/wait-for-it.sh localhost:5432
	$(MAKE) test

deploy:
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);
