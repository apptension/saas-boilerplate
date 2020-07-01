SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/../../base.mk

install:
	pipenv install --dev

install-deploy: install-infra-cdk install-infra-functions

setup:
	chmod +x ./scripts/*.sh

test:
	$(DOCKER_COMPOSE) run -T backend ./scripts/run_tests.sh

build:
	$(MAKE) test
	$(AWS_VAULT) /bin/sh ./scripts/build.sh

deploy-admin-panel:
	cd $(BASE_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *AdminPanelStack;

deploy-api:
	cd $(BASE_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *ApiStack;

deploy-migrations:
	cd $(BASE_DIR)/infra/cdk;\
	npm run build;\
	$(AWS_VAULT) $(CDK_DEPLOY) *MigrationsStack;

	cd $(BASE_DIR)/infra/functions;\
	$(AWS_VAULT) sls invoke --stage $(ENV_STAGE) -f TriggerMigrationsJob

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
