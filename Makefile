SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))
include $(SELF_DIR)/base.mk

.PHONY: shell help build rebuild service login test clean prune version

COMPOSE_BACKEND_SHELL = docker-compose -p $(PROJECT_NAME)_$(HOST_UID) run --rm backend

shell:
ifeq ($(CMD_ARGUMENTS),)
	# no command is given, default to shell
	$(COMPOSE_BACKEND_SHELL) sh
else
	# run the command
	$(COMPOSE_BACKEND_SHELL) sh -c "$(CMD_ARGUMENTS)"
endif

install: install-infra-cdk install-infra-functions
	$(MAKE) -C $(SELF_DIR)/services/backend install
	$(MAKE) -C $(SELF_DIR)/services/workers install
	$(MAKE) -C $(SELF_DIR)/services/webapp install

setup-infra:
	chmod +x ./scripts/*.sh
	$(AWS_VAULT) scripts/cdk-bootstrap.sh

setup-docker:
	docker volume create --name=$(PROJECT_NAME)-web-backend-db-data

setup: install setup-infra setup-docker

up:
	# run as a (background) service
	$(AWS_VAULT) docker-compose -p $(PROJECT_NAME)_$(HOST_UID) up --build --force-recreate

down:
	# run as a (background) service
	docker-compose -p $(PROJECT_NAME)_$(HOST_UID) down

login: up
	# run as a service and attach to it
	docker exec -it $(PROJECT_NAME)_$(HOST_UID) bash

clean:
	# remove created images
	@docker-compose -p $(PROJECT_NAME)_$(HOST_UID) down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) for "$(PROJECT_NAME):$(HOST_USER)" removed.' \
	|| echo 'Image(s) for "$(PROJECT_NAME):$(HOST_USER)" already removed.'

prune:
	# clean all that is not actively used
	docker system prune -af

test:
	# here it is useful to add your own customised tests
	docker-compose -p $(PROJECT_NAME)_$(HOST_UID) run --rm backend sh -c '\
		echo "I am `whoami`. My uid is `id -u`." && echo "Docker runs!"' \
	&& echo success

makemigrations:
	$(COMPOSE_BACKEND_SHELL) sh -c "python ./manage.py makemigrations"

migrate:
	$(COMPOSE_BACKEND_SHELL) sh -c "python ./manage.py migrate"

#
# Infrastructure deployment
#

deploy-global-infra:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *GlobalStack;

deploy-infra-main:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *MainStack;

deploy-infra-ci:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *CiStack;

deploy-infra-functions:
	cd $(SELF_DIR)infra/functions;\
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);

deploy-stage-infra: deploy-infra-main deploy-infra-functions deploy-infra-ci

#
# Services deployment
#

build:
	@echo Build version: $(VERSION)
	$(AWS_VAULT) $(MAKE) -C services/backend build
	$(MAKE) -C services/webapp build
	$(MAKE) -C services/workers build

deploy-components:
	cd $(SELF_DIR)infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *ComponentsStack;

deploy-stage-app: deploy-components
	$(MAKE) -C services/backend deploy-migrations
	$(MAKE) -C services/backend deploy-admin-panel
	$(MAKE) -C services/backend deploy-api
	$(MAKE) -C services/workers deploy
	$(MAKE) -C services/webapp deploy
