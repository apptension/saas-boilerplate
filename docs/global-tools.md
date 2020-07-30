# Global tools
The boilerplate includes some helper tools that you can deploy together with your app.
Right now we only provide on such tool – version matrix.

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

Type: `string`
Example: `Z1019320SEC473QW1LV2`

##### `hostedZone.name`

Type: `string`

Example: `awsb.apptoku.com`

##### `domains.versionMatrix`

Type: `string`

Example: `status.awsb.apptoku.com`

## Listed services
### Version matrix
This tool displays a list of all environment stages (e.g. `dev`, `stage`, `prod`) and their metadata:
- Currently deployed version
- Deployment time
- List of services deployed to the environment stage
- Links to services available through HTTP


<p align="center"> 
    <b>An opinionated guide on how to become a professional Web/Mobile App Developer.</b> 
    <br /><br /> 
    <img src="/docs/images/version-matrix.png" alt="Version matrix" height="300" /> 
</p>

