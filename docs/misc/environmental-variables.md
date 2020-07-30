# Setting service SSM parameters
Environmental variables are kept in AWS SSM parameter store. All of them are named in following pattern: 
`env-${PROJECT_NAME}-${ENV_STAGE}-${SERVICE_NAME}`

We've prepared a simple tool that allows you to quickly define SSM parameters for a 
service from your local machine. 

## Installing requirements
First you need to install some tools in your system.

### [chamber](https://github.com/segmentio/chamber#installing)
### vipe
This is a text editor which works with pipes. This way your secret values will never be saved to a local file.

#### MacOs
```shell
brew install moreutils
```

## Set services' values
### Backend
```shell
# Make sure you are in a proper environment
make aws-vault ENV_STAGE=dev

cd services/backend
make chamber
```
