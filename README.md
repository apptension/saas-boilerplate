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

# How do I use this boilerplate?

- [ ] Check the [prerequisites](/docs/prerequisites.md)
- [ ] First you need to [setup the project](/docs/setup-project.md)
- [ ] Second you need to [deploy the global infrastructure](/docs/global-infra-deployment.md)
- [ ] Next you need to [create a new environment](/docs/create-new-env.md)
- [ ] And finally you can [deploy the app to your environment](/docs/app-deployment.md)

# Components reference


## Services

The boilerplate contains a number of typical services that are ready to be deployed to AWS.
Each of them resides in the `services` directory and has to contain a `Makefile`. Do not change the names of the rules
that are defined in Makefiles unless you know what you're doing. Most of them are used in CodeBuild jobs in your CI 
pipeline.

- [Web App](/services/webapp) – Single page application
- [Backend](/services/backend) – Contains three services:
    * API backend
    * Admin Panel
    * Migrations
- [Async Workers](/services/workers) – Serverless Framework


## Continuous integration / Continuous Deployment

Each deployed environment comes with a preconfigured CI/CD implemented with AWS CodeCommit, AWS CodeBuild, 
and AWS CodePipeline. The general idea of deployment is for the user to push code to a `master` branch of the CodeCommit 
repository created by the Ci CDK Stack. Check out the [CI/CD documentation](/docs/cicd) to learn more.


## Additional
- [Global Tools](/docs/global-tools.md) – Optional helper tools
- [SSH bastion](/docs/ssh-bastion.md)


# Misc
- [Creating a new Serverless service](/docs/misc/create-new-serverless-service.md)
- [Environmental Variables](/docs/misc/environmental-variables.md)

