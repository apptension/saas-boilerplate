# Application environment

## Prerequisites

### Public hosted zone in Route53
Before we create the environment you need to have a public Hosted Zone in AWS Route53.
AWS boilerplate will use this hosted zone's domain to route traffic to your app.

> A hosted zone is a container for records, and records contain information about how you want to route traffic for a specific domain, such as example.com, and its subdomains (acme.example.com, zenith.example.com). A hosted zone and the corresponding domain have the same name.
> 
>Source: [AWS docs](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-working-with.html)

Depending on your use case there are multiple approaches to creating a hosted zone:

 1. You don't have a domain yet.
 
    - Follow this tutorial prepared by AWS team: [Domain registration docs](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html)
 
 2. You have a domain registered in external DNR (e.g. GoDaddy).
 
    - Active domain (with users) – follow this tutorial by AWS team: [Migrate active DNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-in-use.html)
    - Inactive domain (no users) – follow this tutorial by AWS team: [Migrate inactive DNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-inactive.html)
    
 3. You have a domain in Route53 already and want to create a subdomain for the env. 
 
    - Follow this tutorial prepared by AWS team: [Route traffic for subdomains](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-routing-traffic-for-subdomains.html)

 4. You have a domain in Route53 already.
 
    - You most likely already have a hosted zone! You're good to go.

## Configuration

The very first thing you need to do is to generate a configuration file that will describe your 
environment. AWS boilerplate expects such file to exist in a root directory and follow a specific naming pattern to be 
able to discover it when running some `make` rules. 

Let's say you want to create an environment named `dev`. The configuration file should be named `.awsboilerplate.dev.json`.
You can easily create it with the following `make` rule we've created for you:
```sh
make create-env
```

> See configuration file [spec](#configuration-file-specification) for more details.

## Infrastructure deployment
Now that the configuration part is done you can switch to aws-vault session of this new environment:
```sh
make aws-vault ENV_STAGE=dev
```

Now you can deploy an actual infrastructure of your app by running following command:
```shell
make deploy-env-infra
```

When CDK finishes successfully you'll be almost ready to deploy your application!

## Set environmental variables
Every running app needs some environment specific runtime values to run properly. Those could either be some secret 
keys for a 3rd party service, boolean flags enabling features, and much much more. 

We chose AWS Systems Manager Parameter Store to keep such variables and utilize a tool named [`chamber`](https://github.com/segmentio/chamber)
to actually manage them with ease.

Before you deploy your application's code you have to set all required environmental variables.

##### Backend
You can set backend variables in a JSON format using following `make` rule:

```shell
make -C services/backend secrets
```


| Name              | Example                          | Description                                                                   |
|-------------------|----------------------------------|-------------------------------------------------------------------------------|
| DJANGO_DEBUG      | True                             | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#std:setting-DEBUG) |
| DJANGO_SECRET_KEY | Zs639zRcb5!9om2@tW2H6XG#Znj^TB^I | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#secret-key)        |
| HASHID_FIELD_SALT | t5$^r*xsMRXn1xjzhRSl8I5Hb3BUW$4U | [docs](https://github.com/nshafer/django-hashid-field#hashid_field_salt)      |


## (Optional) Deploy application's code
This step is optional because it usually should be run through CI/CD pipeline. We didn't want to limit you so we also
prepared a way to deploy the app fully from your local machine. There are two steps – building artifacts and deploying.

Build application's code
```sh
make build
```

Deploy artifacts to the newly created env:
```sh
make deploy-env-app
```


<hr>

#### Configuration file specification

##### `deployBranches`
A list of branches that will trigger automatic deployment of this environment.

Type: `Array<string>`

Example: `['master']`

##### `hostedZone.id`
Id of a AWS Route53 hosted zone of a domain used to host services of this env.

Type: `string`
Example: `Z1019320SEC473QW1LV2`

##### `hostedZone.name`
Name of a AWS Route53 hosted zone of a domain used to host services of this env.

Type: `string`

Example: `dev.awsb.apptoku.com`

##### `basicAuth`
This flag controls if basic auth should be used to access services via HTTP.

Type: `string`

Example: `username:password`

##### `domains.adminPanel`
A domain used to host an admin panel service.

Type: `string`

Example: `admin.dev.awsb.apptoku.com`

##### `domains.api`
A domain used to host an API backend service.

Type: `string`

Example: `api.dev.awsb.apptoku.com`

##### `domains.webApp`
A domain used to host the web app.

Type: `string`

Example: `app.dev.awsb.apptoku.com`
