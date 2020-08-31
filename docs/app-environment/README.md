# Application environment

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
make deploy-stage-infra
```

When CDK finishes successfully you'll be almost ready to deploy your application!

## Set environmental variables
Every running app needs some environment specific runtime values to run properly. Those could either be some secret 
keys for a 3rd party service, boolean flags enabling features, and much much more. 

We chose AWS Systems Manager Parameter Store to keep such variables and utilize a tool named [`chamber`](https://github.com/segmentio/chamber)
to actually manage them with ease.

Before you deploy your application's code make sure you set up all required environmental variables.

##### Backend


| Name              | Example                          | Description                                                                   |
|-------------------|----------------------------------|-------------------------------------------------------------------------------|
| DJANGO_DEBUG      | True                             | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#std:setting-DEBUG) |
| DJANGO_SECRET_KEY | Zs639zRcb5!9om2@tW2H6XG#Znj^TB^I | [docs](https://docs.djangoproject.com/en/3.0/ref/settings/#secret-key)        |
| HASHID_FIELD_SALT | t5$^r*xsMRXn1xjzhRSl8I5Hb3BUW$4U | [docs](https://github.com/nshafer/django-hashid-field#hashid_field_salt)      |

You can set those variables using following `make` rule:

```shell
make -C services/backend chamber
```

## (Optional) Deploy application's code
This step is optional because it usually should be run through CI/CD pipeline. We didn't want to limit you so we also
prepared a way to deploy the app fully from your local machine. There are two steps – building artifacts and deploying.

### Build application's code
```sh
make build
```

## Deploy application's code to your environment
```sh
make deploy-stage-app
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