SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

COMPOSE_SHELL = docker-compose -p $(PROJECT_NAME)_$(HOST_UID) run --rm backend

shell:
ifeq ($(CMD_ARGUMENTS),)
	# no command is given, default to shell
	$(COMPOSE_SHELL) sh
else
	# run the command
	$(COMPOSE_SHELL) sh -c "$(CMD_ARGUMENTS)"
endif

install:
	pipenv install --dev

install-deploy: install-infra-cdk install-infra-functions

setup:
	chmod +x ./scripts/*.sh

black:
ifeq ($(CI),true)
	$(DOCKER_COMPOSE) exec -T backend pipenv run black --config=pyproject.toml --check .
else
	$(DOCKER_COMPOSE) exec -T backend pipenv run black --config=pyproject.toml .
endif

test:
	$(DOCKER_COMPOSE) up -d backend
	$(MAKE) black
	$(DOCKER_COMPOSE) exec -T backend python setup.py test
	$(DOCKER_COMPOSE) down

build: test
	$(AWS_VAULT) /bin/sh ./scripts/build.sh

deploy-admin-panel:
	cd $(BASE_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) npm run cdk deploy *AdminPanelStack;

deploy-api:
	cd $(BASE_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) npm run cdk deploy *ApiStack;

deploy-migrations:
	cd $(BASE_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) npm run cdk deploy *MigrationsStack;

	cd $(BASE_DIR)/infra/functions;\
	$(AWS_VAULT) sls invoke --stage $(ENV_STAGE) -f TriggerMigrationsJob

deploy: deploy-migrations deploy-admin-panel deploy-api

makemigrations:
	$(COMPOSE_SHELL) sh -c "python ./manage.py makemigrations"

migrate:
	$(COMPOSE_SHELL) sh -c "python ./manage.py migrate"
