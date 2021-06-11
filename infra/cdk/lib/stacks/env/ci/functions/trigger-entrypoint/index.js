'use strict';

const AWS = require('aws-sdk');
const globToRegExp = require('glob-to-regexp');

module.exports.handler = async(event, context) => {
    console.log('Start trigger entrypoint', { PROJECT_ENV_NAME: process.env.PROJECT_ENV_NAME, event });

    const codebuild = new AWS.CodeBuild();
    const branches = JSON.parse(process.env.DEPLOY_BRANCHES || '') || [];
    const projectName = process.env.PROJECT_NAME;
    if (!projectName) {
        throw 'Invalid project name';
    }
    const { detail: { referenceName }} = event;
    // check if reverenceName is in branches
    const filteredBranches = branches.map(branch => ({
        branch,
        regex: globToRegExp(branch, {globstar: true})
    }))
        .filter(pattern => pattern.regex.test(referenceName));

    if (filteredBranches.length > 0) {
        console.log('Trigger deploy:', referenceName, filteredBranches[0]);
        await codebuild.startBuild({
            projectName,
            sourceVersion: referenceName,
        }).
        on('success', function(response) {
            console.log('Codebuild started!', response);
        }).
        on('error', function(error, response) {
            console.log('Run codebuild error', error, response);
        }).promise();
    }

    return { event, branches, filteredBranches };
};
