---
title: Initial setup
---

import useBaseUrl from "@docusaurus/useBaseUrl";

## Prerequisites
- AWS account with admin role
- A domain

---

## [AWS vault](https://github.com/99designs/aws-vault) profile
### Create profiles
This profile will be used by `Make` when running any commands that communicate with AWS platform.

```shell
aws-vault add <your-personal-user-name>
```

>You should find your `Enter Access Key Id` and `Enter Secret Key` in <br /> the `My security credentials` section of your AWS web panel.


Next you should create a profile for the project admin (connect your account with the admin role). 
For that purpose you need to manually edit aws config file. As this profile name will be vastly used we recommend to keep it very short (max 4 chars, e.g "saas").
```shell
open ~/.aws/config
```
add new section (example below) and save the file
```shell
[profile saas]
source_profile = your-personal-user-name
role_arn = arn:aws:iam::123456789:role/SaaSBoilerplateAdminRole
```

Values to save:

- `name` of the second aws-vault profile (`saas` from the example above). This is the `AWS Profile name` which you specify when using the setup.sh script.

### Multi-factor authentication

It _may_ be also required to configure MFA for your AWS user and AWS Vault profile.

If during the deployment you encounter similar error:
```
infra/cdk$ npm run cdk deploy *CiStack
…
3:25:45 PM | UPDATE_FAILED        | AWS::CodeBuild::Project     | PipelineConfigWebA...ildProject04B4719B
AccessDenied. User doesn't have permission to call iam:GetRole
```

consider configuring MFA, as documented in [the official docs](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_enable_virtual.html#enable-virt-mfa-for-root).

Copy the serial MFA device serial number

<img src={useBaseUrl("img/initial-setup-mfa-serial-number.png")} alt="MFA serial number" />

And paste it into the `~/.aws/config` as `mfa_serial` property (example below) and save the file.

```shell {4}
[profile saas]
source_profile = your-personal-user-name
role_arn = arn:aws:iam::123456789:role/SaaSBoilerplateAdminRole
mfa_serial=arn:aws:iam::123456789:mfa/someone@example.com
```

:::note
Unfortunately, from now on, you will have to enter MFA every time you log into the AWS console or run `aws-vault`
:::

### Main config file
Now you can use that profile name in `.awsboilerplate.json` file
```shell
"projectName": "saas",
"defaultEnv": "qa",
"aws": {
    "profile": "saas",
    "region": "eu-west-1"
},
...
```

### AWS vault usage
From now on you can use  aws-vault for secure connection with AWS platform.
Always make sure you are in a proper aws-vault context when you run commands that use AWS CLI.
We created a `make` rule that simplifies this process:

```shell
make aws-vault
```

This command will use default environment (more about them in next section), which is being set as `defaultEnv` in `.awsboilerplate.json`.

You can also manually select environment context by passing it directly:

```shell
make aws-vault ENV_STAGE=qa
```

> Check out the [usage docs](https://github.com/99designs/aws-vault/blob/master/USAGE.md) for more info about how you can utilize aws-vault.

---

## Create a hosted zone

In order to access any environment you need to have a public Hosted Zone in AWS Route53.
AWS boilerplate will use this hosted zone's domain to route traffic to your app.

> A hosted zone is a container for records, and records contain information about how you want to route traffic for a specific domain, such as example.com, and its subdomains (acme.example.com, zenith.example.com). A hosted zone and the corresponding domain have the same name.
>
> Source: [AWS docs](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/hosted-zones-working-with.html)

Depending on your use case there are multiple approaches to creating a hosted zone:

1.  You don't have a domain yet.

    - Follow this tutorial prepared by AWS team: [Domain registration docs](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html)

2.  You have a domain registered in external DNR (e.g. GoDaddy).

    - Active domain (with users) – follow this tutorial by AWS team: [Migrate active DNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-in-use.html)
    - Inactive domain (no users) – follow this tutorial by AWS team: [Migrate inactive DNS](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/migrate-dns-domain-inactive.html)

3.  You have a domain in Route53 already and want to create a subdomain for the env.

    - Follow this tutorial prepared by AWS team: [Route traffic for subdomains](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/dns-routing-traffic-for-subdomains.html)

4.  You have a domain in Route53 already.

    - You most likely already have a hosted zone! You're good to go.
    

Values to save:

- `id` of the hosted zone
- `name` of the hosted zone

---

## Bootstrap CDK

Switch to AWS context using aws-vault to get access to role with admin rights

```shell
make aws-vault ENV_STAGE=qa
```

:::caution Config issue
Despite the fact that in this case we don't need any environment context (only admin role), currently there is configuration issue that will use env context any way, so please DONT use `local` env in this case.
:::

Run CDK bootstrap

```shell
make setup-infra
```

## Deploy Global Infrastructure to AWS

Next up is the [global infrastructure](/setup-aws/infrastructure-components#global-infrastructure) CDK stack to create
the foundations of your system. Resources created in this step will be used by all environments that you'll create in the
future.

```shell
make deploy-global-infra
```

:::info
In case of deployment failure related to certificate issues. You might simply try to make the deploy again.  
:::

Another part of the global infrastructure are the base images for all services. To create them, run the CodeBuild project `<project name>-base-images`.


## Setup Docker Hub account
We need to setup dockerhub credentials in order receive access to their images base.
You can create new dockerhub account (there is a free tier) or get access to a existing one from the client. 
Third option is to use guest account (empty credentials) but in that case there is a very limited number daily downloads which is shared with other AWS users which will cause builds to fail randomly (quite often).

To setup dockerhub credentials go to AWS web panel, access `Secrets manager` and select `GlobalBuildSecrets`, now find `Secret value` section and click `Retrieve secret value` and then `edit`.
This secret may initially be set to a placeholder value, which you can delete.

Secret's value have to be an object:
```shell
{
  "DOCKER_USERNAME": "example@email.com",
  "DOCKER_PASSWORD": "password123"
}
```

:::tip Dev Tools

This is also a good time to deploy our helper tools.
More info can be found [here](/features/dev-tools/global-tools)

:::
