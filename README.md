# AWS Boilerplate

Opinionated full stack web app's boilerplate, ready to be deployed to AWS platform.

## What's included?
You environment will have everything you need in a full-stack 
- Backend API hosted in AWS ECS
- Admin Panel hosted in AWS ECS
- Asynchronous Workers hosted with AWS Lambda
- Web app's frontend hosted with AWS S3 and AWS CloudFront
- Multi-environment support (`dev`, `qa`, `stage`, `prod`, etc)
- Continuous Deployment pipeline built with `CodePipeline`

## General overview

```
my-app
├── infra
│   ├── cdk
│   └── functions
├── services
│   ├── backend
│   ├── webapp
│   └── workers
├── README.md
├── .awsboilerplate.json
├── base.mk
├── docker-compose.ci.yml
├── docker-compose.override.yml
├── docker-compose.yml
├── Makefile
└── setup.sh
```

## Initial setup
You may skip this step if you don't want to deploy app to AWS just yet. 

### Requirements
Following components are expected to already be installed in your system:
* Python >= 3.8
* NodeJS >= 12.0
* Docker
* aws-vault
* aws-cli v1

#### Create a hosted zone
The app is HTTPs only so you will need at least one domain and a hosted zone in Route53. 

Values to save:
* `id` of the hosted zone
* `name` of the hosted zone

#### Create a certificate in your app's primary region
This certificate will be used by Application Load Balancer.

Values to save:
* `arn` of the certificate

#### Create a certificate in us-east-1 (N. Virginia)
This certificate will be used by CloudFront.

Values to save:
* `arn` of the certificate

#### Create an [aws-vault](https://github.com/99designs/aws-vault) profile
This profile will be used by Make when running any commands that communicate with AWS platform.

Values to save:
* `name` of the aws-vault profile

## Creating the project
### Download repository
Download ZIP file with this repository's code from releases page or clone the `master` branch in order to get the 
latest changes.

### Run setup
You will be asked about resources created during [Initial setup](#initial-setup), but you can input some dummy values 
first and later change them in `.awsboilerplate.json` configuration file.

```shell script
sh ./setup.sh
```

This script will install all possible package dependencies.

## Deploy the app to AWS

### Infrastructure deployment

#### Deploy Global Infrastructure

```shell script
make deploy-global-infra
```

#### Deploy Environment Stage Infrastructure

```shell script
make deploy-stage-infra
```

This command will deploy
* Main CDK stack
* CI CDK stack
* Helper lambda functions

#### Deploy Environment Stage App

##### Configure SSM parameters

* env-${projectEnvName}-admin-panel/DJANGO_DEBUG
* env-${projectEnvName}-admin-panel/DJANGO_SECRET
* env-${projectEnvName}-api/DJANGO_DEBUG
* env-${projectEnvName}-api/DJANGO_SECRET

where `projectEnvName` is a normalized name of your project suffixed with environment name (e.g. `my-app-dev`)

##### Build app components
```shell script
make build
```

##### Deploy app components
```shell script
make deploy-stage-app
```

## Local development
Explain .env file


## TODO tasks
- add lambda layers for requirements
- add slack notifications
