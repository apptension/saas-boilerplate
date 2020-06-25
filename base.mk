PWD ?= pwd_unknown
SELF_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

export PROJECT_ROOT_DIR := $(shell dirname $(realpath $(firstword $(MAKEFILE_LIST))))
CONFIG_FILE ?= $(SELF_DIR)/.awsboilerplate.json

define GetFromCfg
$(shell node -p "require('$(CONFIG_FILE)').$(1)")
endef

export ENV_STAGE ?= $(call GetFromCfg,defaultEnv)
export PROJECT_NAME ?= $(call GetFromCfg,projectName)

export AWS_DEFAULT_REGION ?= $(call GetFromCfg,aws.region)

export HOSTED_ZONE_ID := $(call GetFromCfg,envConfig.$(ENV_STAGE).hostedZone.id)
export HOSTED_ZONE_NAME := $(call GetFromCfg,envConfig.$(ENV_STAGE).hostedZone.name)
export CERTIFICATE_ARN := $(call GetFromCfg,envConfig.$(ENV_STAGE).certificate)
export CLOUD_FRONT_CERTIFICATE_ARN := $(call GetFromCfg,envConfig.$(ENV_STAGE).cloudFrontCertificate)

export ADMIN_PANEL_DOMAIN := $(call GetFromCfg,envConfig.$(ENV_STAGE).domains.adminPanel)
export API_DOMAIN := $(call GetFromCfg,envConfig.$(ENV_STAGE).domains.api)
export WEB_APP_DOMAIN := $(call GetFromCfg,envConfig.$(ENV_STAGE).domains.webApp)
export WWW_DOMAIN := $(call GetFromCfg,envConfig.$(ENV_STAGE).domains.www)

ifeq ($(CI),true)
	AWS_VAULT =
	VERSION := $(shell cat $(SELF_DIR)/VERSION)
else
	AWS_VAULT_PROFILE := $(call GetFromCfg,aws.profile)
	AWS_VAULT = aws-vault exec $(AWS_VAULT_PROFILE) --
	VERSION := $(shell git describe --tags --first-parent --abbrev=11 --long --dirty --always)
endif
export VERSION

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

CMD_ARGUMENTS ?= $(cmd)

export HOST_USER
export HOST_UID

DOCKER_COMPOSE = $(AWS_VAULT) docker-compose -p $(PROJECT_NAME)_$(HOST_UID)

version:
	@echo $(VERSION)

install-infra-cdk:
	npm install -g aws-cdk@1.41.0
	$(MAKE) -C $(SELF_DIR)/infra/cdk install

install-infra-functions:
	$(MAKE) -C $(SELF_DIR)/infra/functions install

aws-shell:
	$(AWS_VAULT) $(SHELL)

up:
	$(DOCKER_COMPOSE) up --build --force-recreate -d

down:
	# run as a (background) service
	docker-compose -p $(PROJECT_NAME)_$(HOST_UID) down

clean:
	# remove created images
	@docker-compose -p $(PROJECT_NAME)_$(HOST_UID) down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) for "$(PROJECT_NAME):$(HOST_USER)" removed.' \
	|| echo 'Image(s) for "$(PROJECT_NAME):$(HOST_USER)" already removed.'

prune:
	# clean all that is not actively used
	docker system prune -af
