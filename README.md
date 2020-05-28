# AWS Boilerplate

## Project setup guide

Run setup
```shell script
sh ./setup.sh
```

- Change `web_backend_db_data` volume name in docker-compose and Makefile
- run `make setup`
- set NGINX_SERVER_NAME and NGINX_BACKEND_HOST variables
- set parameter store variables
    * env-${envSettings.projectEnvName}-admin-panel/DJANGO_DEBUG
    * env-${envSettings.projectEnvName}-admin-panel/DJANGO_SECRET
    * env-${envSettings.projectEnvName}-api/DJANGO_DEBUG
    * env-${envSettings.projectEnvName}-api/DJANGO_SECRET

## Make commands

### local

#### setup

#### up
Starts local docker containers

#### down


### 
#### build-all

#### deploy-global-infra

#### deploy-stage-infra

#### deploy-stage-app

## TODO
- add lambda layers for requirements
- add slack notifications
