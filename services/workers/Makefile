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
	$(DOCKER_COMPOSE) -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.ci.yml run -d db
	$(MAKE) test

deploy:
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);
