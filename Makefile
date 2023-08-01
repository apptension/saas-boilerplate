SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/Makefile.base.mk

npx envinfo --system --npmPackages  --binaries --browsers:
	pnpm nx run tools:bootstrap-infra
	pnpm nx run --output-style=stream infra-shared:bootstrap

setup:
	pnpm nx run-many --skip-nx-cache --target=setup --projects=core,backend,workers,webapp,e2e-tests

#
# Infrastructure deployment
#

deploy-env-infra:
	pnpm nx run --output-style=stream infra-shared:deploy:global
	pnpm nx run --output-style=stream infra-shared:deploy:main
	pnpm nx run --output-style=stream infra-shared:deploy:db
	pnpm nx run --output-style=stream infra-functions:deploy
	pnpm nx run --output-style=stream infra-shared:deploy:ci
	pnpm nx run --output-style=stream infra-shared:deploy:components

upload-version:
	pnpm nx run --output-style=stream tools:upload-version migrations,api,workers,webapp

#
# Packages deployment
#

build:
	pnpm nx run-many --output-style=stream --target=build --projects=backend,workers,webapp

lint:
	pnpm nx run-many --output-style=stream --target=lint

deploy-components:
	pnpm nx run --output-style=stream infra-shared:deploy:components

deploy-env-app: deploy-components
	pnpm nx run-many --output-style=stream --target=deploy --projects=backend,workers,webapp

stop-task-scheduling-executions:
	pnpm nx run --output-style=stream workers:stop-task-scheduling-executions

#
# Helper rules
#

psql:
	docker compose exec db psql -d'backend' -U'backend'

create-repo-auth-url:
	pnpm nx run --output-style=stream tools:create-cicd-creds

create-docker-volume:
	pnpm nx run --output-style=stream core:docker-create-volumes
