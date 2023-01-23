SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

setup:
	chmod +x ./scripts/*.sh

test:
	nx test

build:
	nx build

deploy-api:
	nx deploy:api

deploy-migrations:
	nx deploy:migrations

deploy:
	nx deploy

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

secrets:
	nx run ssm-editor:serve backend

