# Setup project


## Initial setup

### Create a hosted zone
The app is HTTPs only so you will need at least one domain and a hosted zone in Route53. 

Values to save:
* `id` of the hosted zone
* `name` of the hosted zone


### Create an [aws-vault](https://github.com/99designs/aws-vault) profile
This profile will be used by Make when running any commands that communicate with AWS platform.

Values to save:
* `name` of the aws-vault profile

## Creating the project
### Download repository
Download ZIP file with this repository's code from releases page or clone the `master` branch in order to get the 
latest changes.


This script will install all possible package dependencies.

#### Switch to AWS context using aws-vault [^1]
```shell
make aws-vault
```

#### Run CDK bootstrap [^1]
```shell
make setup-infra
```

---
[^1]: Can be omitted during setup of local environment.
