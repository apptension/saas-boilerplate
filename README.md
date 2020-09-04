# AWS Boilerplate

<p align="center"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="AWS Boilerplate License" /> <img src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" alt="Maintenance" /> </p>

> Note: The documentation is a work in progress. It will be in a much better state in couple of days!

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

## Prerequisites

- Install latest [Node.js](https://nodejs.org/en/download/package-manager/#macos) (with NPM >= 6)
- Install Python 3.8
  
  > We recommend installing Python using [`pyenv`](https://github.com/pyenv/pyenv)
                          
- Install [Pipenv](https://github.com/pypa/pipenv#installation)
- Install [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html) version 2
- Install [Docker](https://docs.docker.com/get-docker)

## Installation
We recommend cloning this repository instead of downloading the ZIP. This way you'll be able to
merge latest changes without too much hassle by resolving conflicts using your favourite tools. 

To setup the project and install local dependencies run following command:

```sh
sh ./setup.sh
```

## Running locally

Run backend services:
```sh
make up
```

Backend is running on `http://localhost:5000`.

Admin Panel is running on `http://admin.localhost:5000`.

Workers do not expose any http address.

## System architecture diagram

<p align="center"> <img src="/docs/images/system-diagram-v1.png" alt="System Diagram" /> </p>

## How do I deploy the app to AWS?

Check out our [deployment to AWS](/docs/guides/aws-deployment.md) documentation

## Services included in boilerplate

The boilerplate contains a number of typical services that are ready to be deployed to AWS.
Each of them resides in the `services` directory and has to contain a `Makefile`. Do not change the names of the rules
that are defined in Makefiles unless you know what you're doing. Most of them are used in CodeBuild jobs in your CI 
pipeline.

- [Web App](/services/webapp) – Single page application
- [Backend](/services/backend) – Django app containing three services:
    * API backend
    * Admin Panel
    * Migrations
- [Async Workers](/services/workers) – Serverless Framework


## Continuous integration / Continuous Deployment

Each deployed environment comes with a preconfigured CI/CD implemented with AWS CodeCommit, AWS CodeBuild, 
and AWS CodePipeline. The general idea of deployment is for the user to push code to a `master` branch of the CodeCommit 
repository created by the Ci CDK Stack.
 
Check out the [CI/CD documentation](/docs/cicd) to learn more.

<p align="center"> <img src="/docs/images/cicd-diagram-v3.png" alt="CI/CD Diagram" /> </p>

## Guides
- [Creating new application environment](/docs/app-environment)
- [Using optional helper tools](/docs/global-tools.md)
- [Running SSH bastion](/docs/ssh-bastion.md) to run backend commands in ECS Container
- [Creating new Serverless service](/docs/misc/create-new-serverless-service.md)
