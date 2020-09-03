function prefixResourceName(name) {
  return `${PROJECT_NAME}-${ENV_STAGE}-${name}`;
}

async function getOutputsFromStack(stackName) {
  const describeStackResult = await cloudFormation.describeStacks({
    StackName: prefixResourceName(stackName),
  }).promise();

  const { Outputs: outputs } = describeStackResult.Stacks[0];
  return indexBy(prop('ExportName'), outputs);
}