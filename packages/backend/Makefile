SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../Makefile.base.mk

IS_BACKEND_CURRENT_DIR := $(shell pwd | grep 'packages/backend')
ifneq ($(IS_BACKEND_CURRENT_DIR),)
	export COMPOSE_FILE=$(SELF_DIR)/../../docker-compose.yml:$(SELF_DIR)/../../docker-compose.local.yml
endif

setup:
	chmod +x ./scripts/*.sh

build-docs:
	pnpm nx build-docs

# Local CLI rules

shell:
	docker-compose run --rm backend bash

create-app:
	docker-compose run --rm -T backend sh -c "cd apps && django-admin startapp $(app_name)"

makemigrations:
	docker-compose run --rm -T backend sh -c "python ./manage.py makemigrations"

migrate:
	docker-compose run --rm -T backend sh -c "python ./manage.py migrate"

ruff:
	docker-compose run --rm -T --no-deps backend ruff check .

black:
	docker-compose run --rm -T --no-deps backend black --config=pyproject.toml .

check-migrations:
	docker-compose run --rm -T backend sh -c "python ./manage.py makemigrations --check --dry-run"

sync-stripe:
	docker-compose run --rm -T backend sh -c "python ./manage.py djstripe_sync_models"

secrets:
	$(MAKE) -C $(PROJECT_ROOT_DIR) secrets-editor SERVICE_NAME=backend

remote-shell:
	pnpm nx remote-shell

