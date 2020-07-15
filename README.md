# AWS Boilerplate
Opinionated full stack web app's boilerplate, ready to be deployed to AWS platform. Configured using CDK and Serverless 
framework.

> Note: This is a work in progress

## What's included?
You environment will have everything you need in a full-stack 
* Backend API hosted in AWS ECS
* Admin Panel hosted in AWS ECS
* Asynchronous Workers hosted with AWS Lambda using Serverless Framework
* Web app's frontend hosted with AWS S3 and AWS CloudFront
* Multi-environment support (`dev`, `qa`, `stage`, `prod`, etc)
* Continuous Deployment pipeline built with `CodePipeline`
* Dashboard displaying a list of existing environments and deployed app versions

## General overview
The primary objective of this boilerplate is to give you a production ready code that reduces the amount of time you 
would normally have to spend on system infrastructure's configuration. It contains a number of services that a typical
web application has (frontend, backend api, admin panel, workers) as well as their continuous deployment. Using this 
boilerplate you can deploy multiple environments, each representing a different stage in your pipeline.

We don't create any new CLIs or APIs that you need to learn. We use existing solutions, 
which you can extend or change however you like:
* Make
* CDK (TypeScript)
* Serverless Framework
* Docker

### Environment stage
A version of your app that represents a specific stage of your pipeline. We typically use those:
* `dev` – least stable stage that developers interact every day. It's the first place they can test their changes 
without breaking other envs
* `qa` – stage used by QA specialists. Usually used to deploy specific version of the app to run tests against.
* `staging` – more stable stage used to host a current code that is scheduled for production deployment. QA specialists 
test this environment before approving code to be deployed to production
* `production` – the thing you don't touch on Friday at 4pm 

### Global infrastructure
A CDK stack that contains resources, which are used by multiple environments. If there's no need to create something per
environment stage it should end up in this CDK stack.

### Main stack
A CDK stack that contains resources of a specific environment stage that will be used by multiple services.
This includes among others VPC, RDS intsance, and ECS cluster.


### Ci stack
A CDK stack that contains resources required to run Continuous Integration and Continuous Deployment.

### Helper Functions
A Serverless Framework app that contains all lambda functions that are not specifically part of any services code but
are required by infrastructure components, such us running migrations from a CodePipeline execution.

### Directory structure
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
├── .awsboilerplate.local.json
├── .awsboilerplate.test.json
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

### Create an environment
Each environment needs a hosted zone. You can reuse the same hosted zone for all environments if you want.

```shell script
make create-env
```

## Deploy the app to AWS

### Infrastructure deployment

#### Deploy Global Infrastructure
This command will deploy [Global infrastructure](#global-infrastructure) CDK stack

```shell script
make deploy-global-infra
```

#### Deploy Environment Stage Infrastructure

```shell script
make deploy-stage-infra
```

This command will deploy
* [Main CDK stack](#main-stack)
* [CI CDK stack](#ci-stack)
* [Helper functions](#helper-functions)

#### Deploy Environment Stage App

##### Configure SSM parameters

* env-${projectEnvName}-backend/DJANGO_DEBUG
* env-${projectEnvName}-backend/DJANGO_SECRET_KEY
* env-${projectEnvName}-backend/HASHID_FIELD_SALT

where `projectEnvName` is a normalized name of your project suffixed with environment name (e.g. `my-app-dev`)

##### Build app components
```shell script
make build
```

##### Deploy app components
```shell script
make deploy-stage-app
```
