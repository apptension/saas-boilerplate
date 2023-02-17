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
	docker-compose run --rm backend bash

create-app:
	docker-compose run --rm -T backend sh -c "cd apps && django-admin startapp $(app_name)"

makemigrations:
	docker-compose run --rm -T backend sh -c "python ./manage.py makemigrations"

migrate:
	docker-compose run --rm -T backend sh -c "python ./manage.py migrate"

flake8:
	docker-compose run --rm -T --no-deps backend flake8

black:
	docker-compose run --rm -T --no-deps backend black --config=pyproject.toml .

check-migrations:
	docker-compose run --rm -T backend sh -c "python ./manage.py makemigrations --check --dry-run"

sync-stripe:
	docker-compose run --rm -T backend sh -c "python ./manage.py djstripe_sync_models"

secrets:
	$(MAKE) -C $(PROJECT_ROOT_DIR) secrets-editor SERVICE_NAME=backend

