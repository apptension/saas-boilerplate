const express = require('express');
const bodyParser = require('body-parser');
const { OK, INTERNAL_SERVER_ERROR } = require('http-status-codes');
const AWS = require('aws-sdk');
const { renderEmail } = require('../build/email-renderer');

module.exports = (router) => {
  router.use(bodyParser.urlencoded({ extended: false }));
  router.use(bodyParser.json());
  router.post('/sendEmail', (req, res) => {
    const { type, data, recipient } = req.body;

    const config = {
      fromEmail: 'from@saas.apptoku.com',
    };

    const sesClient = new AWS.SES({
      endpoint: config.awsEndpoint,
    });

    const { subject, html } = renderEmail(type, {
      ...data,
    });

    sesClient
      .sendEmail({
        Source: config.fromEmail,
        Destination: { ToAddresses: [recipient] },
        ReplyToAddresses: [config.fromEmail],
        Message: {
          Subject: { Charset: 'UTF-8', Data: subject },
          Body: { Html: { Charset: 'UTF-8', Data: html } },
        },
      })
      .promise()
      .then(() => {
        console.log('Email sent');
        res.status(OK);
      })
      .catch((err) => {
        console.error(err);
        res.status(INTERNAL_SERVER_ERROR);
      });
  });
};
