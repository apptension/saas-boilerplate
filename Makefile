PWD ?= pwd_unknown

CONFIG_FILE ?= .awsboilerplate.json
define GetFromCfg
$(shell node -p "require('./$(CONFIG_FILE)').$(1)")
endef

export ENV_STAGE ?= dev
export VERSION := $(shell git describe --tags --first-parent --abbrev=11 --long --dirty --always)

export PROJECT_NAME := $(call GetFromCfg,projectName)
export AWS_DEFAULT_REGION := $(call GetFromCfg,aws.region)
export HOSTED_ZONE_ID := $(call GetFromCfg,hostedZone.id)
export HOSTED_ZONE_NAME := $(call GetFromCfg,hostedZone.name)
export CERTIFICATE_ARN := $(call GetFromCfg,certificate)
export ADMIN_PANEL_DOMAIN := $(call GetFromCfg,domains.$(ENV_STAGE).adminPanel)
export API_DOMAIN := $(call GetFromCfg,domains.$(ENV_STAGE).api)
export WEB_APP_DOMAIN := $(call GetFromCfg,domains.$(ENV_STAGE).webApp)
export WWW_DOMAIN := $(call GetFromCfg,domains.$(ENV_STAGE).www)

AWS_VAULT_PROFILE := $(call GetFromCfg,aws.profile)

ifeq ($(user),)
# USER retrieved from env, UID from shell.
HOST_USER ?= $(strip $(if $(USER),$(USER),nodummy))
HOST_UID ?= $(strip $(if $(shell id -u),$(shell id -u),4000))
else
# allow override by adding user= and/ or uid=  (lowercase!).
# uid= defaults to 0 if user= set (i.e. root).
HOST_USER = $(user)
HOST_UID = $(strip $(if $(uid),$(uid),0))
endif

THIS_FILE := $(lastword $(MAKEFILE_LIST))
CMD_ARGUMENTS ?= $(cmd)

export PROJECT_NAME
export HOST_USER
export HOST_UID

.PHONY: shell help build rebuild service login test clean prune

COMPOSE_BACKEND_SHELL = docker-compose -p $(PROJECT_NAME)_$(HOST_UID) run --rm backend
AWS_VAULT = aws-vault exec $(AWS_VAULT_PROFILE) --

shell:
ifeq ($(CMD_ARGUMENTS),)
	# no command is given, default to shell
	$(COMPOSE_BACKEND_SHELL) sh
else
	# run the command
	$(COMPOSE_BACKEND_SHELL) sh -c "$(CMD_ARGUMENTS)"
endif

help:
	@echo ''
	@echo 'Usage: make [TARGET] [EXTRA_ARGUMENTS]'
	@echo 'Targets:'
	@echo '  setup    	setup project for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo '  build    	build docker --image-- for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo '  rebuild  	rebuild docker --image-- for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo '  test     	test docker --container-- for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo '  service   	run as service --container-- for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo '  login   	run as service and login --container-- for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo '  clean    	remove docker --image-- for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo '  prune    	shortcut for docker system prune -af. Cleanup inactive containers and cache.'
	@echo '  shell      run docker --container-- for current user: $(HOST_USER)(uid=$(HOST_UID))'
	@echo ''
	@echo 'Extra arguments:'
	@echo 'cmd=:	make cmd="whoami"'
	@echo '# user= and uid= allows to override current user. Might require additional privileges.'
	@echo 'user=:	make shell user=root (no need to set uid=0)'
	@echo 'uid=:	make shell user=dummy uid=4000 (defaults to 0 if user= set)'

install:
	npm install -g aws-cdk serverless
	$(MAKE) -C infra/cdk install
	$(MAKE) -C infra/functions install
	$(MAKE) -C services/backend install
	$(MAKE) -C services/workers install

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
	docker exec -it $(PROJECT_NAME)_$(HOST_UID) sh

build-backend:
	$(AWS_VAULT) $(MAKE) -C services/backend build

build-all:
	@echo Build version: $(VERSION)
	$(MAKE) build-backend

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
	cd infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *GlobalStack;

deploy-infra-main:
	cd infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *MainStack;

deploy-infra-components:
	cd infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *ComponentsStack;

deploy-infra-functions:
	cd infra/functions;\
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);

deploy-stage-infra: deploy-infra-main deploy-infra-components deploy-infra-functions

#
# Services deployment
#

deploy-admin-panel:
	cd infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *AdminPanelStack;

deploy-api:
	cd infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *ApiStack;

deploy-migrations:
	cd infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *MigrationsStack;

	cd infra/functions;\
	$(AWS_VAULT) sls invoke --stage $(ENV_STAGE) -f TriggerMigrationsJob

deploy-workers:
	cd services/workers;\
	$(AWS_VAULT) sls deploy --stage $(ENV_STAGE);

deploy-web-app:
	cd infra/cdk;\
	npm run build;\
	$(AWS_VAULT) cdk deploy *WebAppStack;

deploy-stage-app: deploy-admin-panel deploy-api deploy-migrations deploy-workers deploy-web-app
