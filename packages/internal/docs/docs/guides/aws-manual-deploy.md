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

You can build & deploy all services (Webapp, Backend, Workers etc) at once or just a single service.
If you want all services run commands below in project's main directory, 
while for single service you need to go to that specific service directory. 

Build application's code:

```sh
make build
```

Deploy artifacts to the newly created env:

```sh
make deploy-env-app
```
