# Setting service SSM parameters
Environmental variables are kept in AWS SSM parameter store. All of them are named in following pattern: 
`env-${PROJECT_NAME}-${ENV_STAGE}-${SERVICE_NAME}`

We've prepared a simple tool that allows you to quickly define SSM parameters for a 
service from your local machine. 

## Installing requirements
First you need to install some tools in your system.

### MacOs

#### [chamber](https://github.com/segmentio/chamber#installing)
A tool, written in go, which allows you to inject SSM parameters as env variables in your shell.

```shell
brew install go
go get github.com/segmentio/chamber
```

#### vipe
This is a text editor which works with pipes. This way your secret values will never be saved to a local file.

```shell
brew install moreutils
```
