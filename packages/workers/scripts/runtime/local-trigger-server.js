const express = require('express');
const bodyParser = require('body-parser');
const { spawn } = require('child_process');
const YAML = require('yaml');
const fs = require('fs');

const app = express();
const port = 3005;
const hostname = '0.0.0.0';

app.use(bodyParser.json());

function invokeFunction(name, data) {
  const sls = spawn(
    'pnpm',
    ['run', 'sls', 'invoke', 'local', '-f', name, '-d', JSON.stringify(data)],
    {
      cwd: '/app/packages/workers',
    }
  );

  sls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  sls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
  });

  sls.on('error', (error) => {
    console.log(`error: ${error.message}`);
  });

  sls.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}

app.post('/', (req, res) => {
  const source = req.body.Source;
  const serverlessConfigFile = fs.readFileSync(
    '/app/packages/workers/serverless.yml',
    'utf8'
  );
  const serverlessConfig = YAML.parse(serverlessConfigFile);

  const invokeData = {
    source: source,
    'detail-type': req.body.DetailType,
    detail: req.body.Detail ? JSON.parse(req.body.Detail) : {},
  };

  Object.keys(serverlessConfig.functions).forEach((fnName) => {
    const fnConfig = serverlessConfig.functions[fnName];
    if (!fnConfig.events) {
      return;
    }
    fnConfig.events.forEach((event) => {
      if (
        event.eventBridge &&
        event.eventBridge.pattern &&
        event.eventBridge.pattern.source &&
        event.eventBridge.pattern.source.includes(source)
      ) {
        invokeFunction(fnName, invokeData);
      }
    });
  });

  res.send({ message: 'OK' });
});

app.listen(port, hostname, () => {
  console.log(`Local trigger server listening at http://${hostname}:${port}`);
});
