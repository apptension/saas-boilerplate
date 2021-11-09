SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	pdm sync

install-deploy: install-infra-cdk install-infra-functions install-scripts

setup:
	chmod +x ./scripts/*.sh

test:
	$(DOCKER_COMPOSE) build backend
	$(DOCKER_COMPOSE) run --rm -T backend ./scripts/run_tests.sh

build:
	$(MAKE) docker-login
	$(MAKE) test
	/bin/sh ./scripts/build.sh

deploy-api: SERVICE_URL=$(call GetFromEnvCfg,domains.api)
deploy-api:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-api
	$(MAKE) upload-service-version SERVICE_NAME=api SERVICE_PARAMS="url=https://$(SERVICE_URL)"

deploy-migrations:
	$(MAKE) -C $(BASE_DIR)/infra/cdk deploy-migrations

	cd $(BASE_DIR)/infra/functions;\
	node_modules/.bin/sls invoke --stage $(ENV_STAGE) -f TriggerMigrationsJob
	$(MAKE) upload-service-version SERVICE_NAME=migrations

deploy: deploy-migrations deploy-api

# Local CLI rules

shell:
	$(DOCKER_COMPOSE) run --rm backend bash

create-app:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "cd apps && django-admin startapp $(app_name)"

makemigrations:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "python ./manage.py makemigrations"

migrate:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "python ./manage.py migrate"

flake8:
	$(DOCKER_COMPOSE) run --rm -T --no-deps backend flake8

black:
	$(DOCKER_COMPOSE) run --rm -T --no-deps backend black --config=pyproject.toml .

check-migrations:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "python ./manage.py makemigrations --check --dry-run"

sync-stripe:
	$(DOCKER_COMPOSE) run --rm -T backend sh -c "python ./manage.py djstripe_sync_models"

secrets: export CHAMBER_SERVICE=backend
secrets:
	$(DOCKER_COMPOSE) build ssmeditor
	$(DOCKER_COMPOSE) run --rm ssmeditor

