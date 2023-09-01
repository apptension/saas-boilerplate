const { STSClient, GetCallerIdentityCommand } = require('@aws-sdk/client-sts');
const {
  SFNClient,
  StartExecutionCommand,
  DescribeExecutionCommand,
  GetExecutionHistoryCommand,
} = require('@aws-sdk/client-sfn');

const { runCommand } = require('./lib/runCommand');

const AWS_DEFAULT_REGION = process.env.AWS_DEFAULT_REGION;
const PROJECT_NAME = process.env.PROJECT_NAME;
const ENV_STAGE = process.env.ENV_STAGE;

const stsClient = new STSClient();
const sfnClient = new SFNClient();

async function poll(executionArn) {
  const timeout = 5 * 60;
  const sleepStep = 10;
  for (let i = timeout; i > 0; i -= sleepStep) {
    const executionData = await sfnClient.send(
      new DescribeExecutionCommand({
        executionArn,
      })
    );
    console.log(`Migrations job status: ${executionData.status}`);
    if (executionData.status !== 'RUNNING') {
      return executionData;
    }

    await new Promise((resolve) => setTimeout(resolve, sleepStep * 1000));
  }
}

(async () => {
  try {
    const { Account: awsAccountId } = await stsClient.send(
      new GetCallerIdentityCommand({})
    );

    console.log('Starting migrations job...');
    const { executionArn } = await sfnClient.send(
      new StartExecutionCommand({
        stateMachineArn: `arn:aws:states:${AWS_DEFAULT_REGION}:${awsAccountId}:stateMachine:${PROJECT_NAME}-${ENV_STAGE}-migrations`,
      })
    );

    const finalResult = await poll(executionArn);
    const executionHistory = await sfnClient.send(
      new GetExecutionHistoryCommand({
        executionArn,
      })
    );
    const taskSubmittedStep = executionHistory.events.find(
      ({ type }) => type === 'TaskSubmitted'
    );

    console.log('Migrations job log pulled from CloudWatch:');
    await runCommand('aws', [
      'logs',
      'tail',
      `${PROJECT_NAME}-${ENV_STAGE}-migrations-log-group`,
      '--since',
      taskSubmittedStep.timestamp.toISOString(),
    ]);

    console.log(`Migrations job result:\n ${JSON.stringify(finalResult)}`);
    if (finalResult.status !== 'SUCCEEDED') {
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
})();
