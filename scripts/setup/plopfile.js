module.exports = function (plop) {
  // controller generator
  plop.setGenerator('config', {
    description: 'Application configuration setup',
    prompts: [
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name',
      },
      {
        type: 'input',
        name: 'awsProfile',
        message: 'AWS Profile',
        default: ({ projectName }) => projectName,
      },
      {
        type: 'input',
        name: 'awsRegion',
        message: 'AWS Region',
        default: 'eu-west-1',
      },
      {
        type: 'input',
        name: 'defaultStage',
        message: 'Default stage',
        default: 'dev',
      },
      {
        type: 'input',
        name: 'hostedZoneId',
        message: 'Hosted zone Id',
      },
      {
        type: 'input',
        name: 'hostedZoneName',
        message: 'Hosted zone name',
      },
      {
        type: 'input',
        name: 'appDomain',
        message: 'App domain',
        default: ({ hostedZoneName }) => hostedZoneName,
      },
      {
        type: 'input',
        name: 'certificate',
        message: 'Certificate ARN',
      },
      {
        type: 'input',
        name: 'cloudFrontCertificate',
        message: 'CloudFront Certificate ARN',
      },
    ],
    actions: [{
      type: 'add',
      path: '../../.awsboilerplate.json',
      templateFile: 'plopTemplates/.awsboilerplate.json.hbs'
    }]
  });
};
