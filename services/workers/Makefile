SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	npm install
	pipenv install --dev

install-deploy: install

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

invoke-hello:
	$(AWS_VAULT) sls invoke --stage $(ENV_STAGE) -f hello;

