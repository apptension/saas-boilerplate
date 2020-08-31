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
        message: 'AWS Profile name',
        default: ({ projectName }) => projectName,
      },
      {
        type: 'input',
        name: 'awsRegion',
        message: 'AWS Region',
        default: 'eu-west-1',
      },
    ],
    actions: [{
      type: 'add',
      force: true,
      path: '../../.awsboilerplate.json',
      templateFile: 'plopTemplates/.awsboilerplate.json.hbs'
    }]
  });

  plop.setGenerator('configTools', {
    description: 'Configure tools',
    prompts: [
      {
        type: 'input',
        name: 'password',
        message: 'Tools basic auth password',
        default: () => Math.random().toString(36).substring(7),
      },
      {
        type: 'input',
        name: 'hostedZoneId',
        message: 'Tools hosted zone Id',
      },
      {
        type: 'input',
        name: 'hostedZoneName',
        message: 'Tools hosted zone name',
      },
      {
        type: 'input',
        name: 'versionMatrixDomain',
        message: 'Version matrix domain name',
        default: ({ name, hostedZoneName }) => `status.${hostedZoneName}`,
      },
    ],
    actions: [
      function (answers) {
        process.chdir(plop.getPlopfilePath());
        var fs = require('fs');
        const configFilePath = plop.getDestBasePath() + '/../../.awsboilerplate.json';

        const toolsConfigTemplate =  fs.readFileSync(plop.getDestBasePath() + '/plopTemplates/.awsboilerplateToolsConfig.json.hbs', 'utf-8')
        const configFileContents = fs.readFileSync(configFilePath, 'utf-8')

        const toolsConfig = JSON.parse(plop.renderString(toolsConfigTemplate, answers));
        const config = JSON.parse(configFileContents);

        const resultConfig = { ...config, toolsConfig }

        fs.writeFileSync(configFilePath, JSON.stringify(resultConfig, null, 2));

        return '';
      }
    ]
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
      {
        type: 'input',
        name: 'deployBranch',
        message: 'Name of the GIT branch used for automatic deployment',
        default: 'master',
      }
    ],
    actions: [{
      type: 'add',
      force: true,
      path: '../../.awsboilerplate.{{name}}.json',
      templateFile: 'plopTemplates/.awsboilerplate.env.json.hbs'
    }]
  });
};
