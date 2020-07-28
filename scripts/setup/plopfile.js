module.exports = function (plop) {
  // controller generator
  plop.setGenerator('config', {
    description: 'Application configuration setup',
    prompts: [
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name, recommended 3 (max 4) characters',
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
        name: 'defaultEnv',
        message: 'Default Env',
        default: 'dev',
      },
      {
        type: 'input',
        name: 'toolsPassword',
        message: 'Tools basic auth password',
        default: () => Math.random().toString(36).substring(7),
      },
    ],
    actions: [{
      type: 'add',
      force: true,
      path: '../../.awsboilerplate.json',
      templateFile: 'plopTemplates/.awsboilerplate.json.hbs'
    }]
  });

  plop.setGenerator('createEnv', {
    description: 'Create new environment',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'Environment name',
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
        name: 'domain',
        message: 'Domain name',
        default: ({ name, hostedZoneName }) => `${name}.${hostedZoneName}`,
      },
      {
        type: 'input',
        name: 'basicAuthPass',
        message: 'Basic auth password',
        default: () => Math.random().toString(36).substring(7)
      },
    ],
    actions: [{
      type: 'add',
      force: true,
      path: '../../.awsboilerplate.{{name}}.json',
      templateFile: 'plopTemplates/.awsboilerplate.env.json.hbs'
    }]
  });
};
