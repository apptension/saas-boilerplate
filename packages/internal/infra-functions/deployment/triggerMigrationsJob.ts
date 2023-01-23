import * as AWS from 'aws-sdk';

async function triggerStateMachine() {
  const { STATE_MACHINE_ARN } = process.env;

  const stepfunctions = new AWS.StepFunctions();

  const request = stepfunctions.startExecution({
    stateMachineArn: STATE_MACHINE_ARN,
    input: JSON.stringify({}),
  });

  return await request.promise();
}

module.exports.handler = async (event, context) => {
  console.log('Event: ', JSON.stringify(event));

  try {
    const response = await triggerStateMachine();
    console.log('Response: ', JSON.stringify(response));
    return { message: JSON.stringify(response), event };
  } catch (err) {
    console.error(err);
    return { message: err.message, event };
  }
};
