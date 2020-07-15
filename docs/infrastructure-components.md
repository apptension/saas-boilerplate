# Infrastructure components

## Global infrastructure

A CDK stack that contains resources, which are used by multiple environments. 
If there's no need to create something per environment stage it should end up in this CDK stack.

## Environment stage
A version of your app that represents a specific stage of your pipeline. We typically use those:
* `dev` – least stable stage that developers interact every day. It's the first place they can test their changes 
without breaking other envs
* `qa` – stage used by QA specialists. Usually used to deploy specific version of the app to run tests against.
* `staging` – more stable stage used to host a current code that is scheduled for production deployment. QA specialists 
test this environment before approving code to be deployed to production
* `production` – the thing you don't touch on Friday at 4pm 

## Main stack
A CDK stack that contains resources of a specific environment stage that will be used by multiple services.
This includes among others VPC, RDS intsance, and ECS cluster.

## Ci stack
A CDK stack that contains resources required to run Continuous Integration and Continuous Deployment.

## Helper Functions
A Serverless Framework app that contains all lambda functions that are not specifically part of any services code but
are required by infrastructure components, such us running migrations from a CodePipeline execution.
