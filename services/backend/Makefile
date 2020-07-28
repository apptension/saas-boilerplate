SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	pipenv install --dev

install-deploy: install-infra-cdk install-infra-functions install-scripts

setup:
	chmod +x ./scripts/*.sh

test:
	$(DOCKER_COMPOSE) run -T backend ./scripts/run_tests.sh

build:
	$(MAKE) test
	/bin/sh ./scripts/build.sh

deploy-admin-panel:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-admin-panel
	$(MAKE) upload-service-version SERVICE_NAME=admin-panel SERVICE_PARAMS="url=https://$(ADMIN_PANEL_DOMAIN)"

deploy-api:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-api
	$(MAKE) upload-service-version SERVICE_NAME=api SERVICE_PARAMS="url=https://$(API_DOMAIN)"

deploy-migrations:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-migrations

	cd $(BASE_DIR)/infra/functions;\
	node_modules/.bin/sls invoke --stage $(ENV_STAGE) -f TriggerMigrationsJob
	$(MAKE) upload-service-version SERVICE_NAME=migrations

deploy: deploy-migrations deploy-admin-panel deploy-api

# Local CLI rules

shell:
	$(DOCKER_COMPOSE) run backend sh


makemigrations:
	$(DOCKER_COMPOSE) run -T backend sh -c "python ./manage.py makemigrations"

migrate:
	$(DOCKER_COMPOSE) run -T backend sh -c "python ./manage.py migrate"

flake8:
	$(DOCKER_COMPOSE) run -T backend flake8

black:
	$(DOCKER_COMPOSE) run -T backend black --config=pyproject.toml .
