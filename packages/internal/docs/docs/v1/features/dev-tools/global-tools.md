---
title: Global tools
---

The boilerplate includes some helper tools that you can deploy together with your app.
Right now we only provide one such tool – version matrix.

## Configuration

You can configure global tools in`.awsboilerplate.json` with a `toolsConfig` key.

##### `enabled`

This flag controls whether tools are enabled or disabled.

Type: `bool`

Example: `true`

##### `basicAuth`

This flag controls if basic auth should be used to access global tools via HTTP.

Type: `string`

Example: `username:password`

##### `hostedZone.id`

Id of a AWS Route53 hosted zone of a domain used to host global tools.

Type: `string`
Example: `Z1019320SEC473QW1LV2`

##### `hostedZone.name`

Name of a AWS Route53 hosted zone of a domain used to host global tools.

Type: `string`

Example: `awsb.apptoku.com`

## Deployment

```shell
make deploy-global-tools
```
