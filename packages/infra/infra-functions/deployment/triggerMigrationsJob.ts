import * as AWS from 'aws-sdk';

async function triggerStateMachine() {
  const { STATE_MACHINE_ARN } = process.env;

  const stepfunctions = new AWS.StepFunctions();

  if (!STATE_MACHINE_ARN) {
    return null;
  }

  const request = stepfunctions.startExecution({
    stateMachineArn: STATE_MACHINE_ARN,
    input: JSON.stringify({}),
  });

  return await request.promise();
}

module.exports.handler = async (event) => {
  console.log('Event: ', JSON.stringify(event));

  try {
    const response = await triggerStateMachine();
    console.log('Response: ', response ? JSON.stringify(response) : null);
    return { message: JSON.stringify(response), event };
  } catch (err) {
    console.error(err);
    return { message: err.message, event };
  }
};
