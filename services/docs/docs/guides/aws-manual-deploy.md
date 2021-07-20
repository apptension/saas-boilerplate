---
title: Manual build & deploy to AWS
---
## Deploy application's code

This step is optional because it usually should be run through CI/CD pipeline. We didn't want to limit you so we also
prepared a way to deploy the app fully from your local machine. There are two steps – building artifacts and deploying.


:::caution Dev Tools Needed

In order to execute manual deploy helper tools need to be deployed before. 

More info can be found [here](/features/dev-tools/global-tools)

:::


Build application's code

```sh
make build
```

Deploy artifacts to the newly created env:

```sh
make deploy-env-app
```

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

Example: `qa.awsb.apptoku.com`

##### `basicAuth`

This flag controls if basic auth should be used to access services via HTTP.

Type: `string`

Example: `username:password`

##### `domains.adminPanel`

A domain used to host an admin panel service.

Type: `string`

Example: `admin.qa.awsb.apptoku.com`

##### `domains.api`

A domain used to host an API backend service.

Type: `string`

Example: `api.qa.awsb.apptoku.com`

##### `domains.webApp`

A domain used to host the web app.

Type: `string`

Example: `app.qa.awsb.apptoku.com`
